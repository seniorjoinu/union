import { useCallback, useState } from 'react';
import { useWallet } from 'services';
import { useCurrentWallet } from './context';

export interface UseBatchUploaderProps {
  chunkSize: number;
  chunksPerOperation: number;
  progress(stats: Stats): any;
}

export type Stats = {
  uploaded: number;
  of: number;
};

export interface UploadProps {
  file: File;
  name?: string;
  prefix?: string;
}

const MAX_CHUNK_SIZE = 1700000;
const CHUNKS_PER_OPERATION = 8;

const defaultProp: UseBatchUploaderProps = {
  chunkSize: MAX_CHUNK_SIZE,
  chunksPerOperation: CHUNKS_PER_OPERATION,
  progress: () => {},
};

export const useBatchUploader = (p?: Partial<UseBatchUploaderProps>) => {
  const { chunkSize, chunksPerOperation, progress } = { ...defaultProp, ...p };

  const { principal } = useCurrentWallet();
  const { canister } = useWallet(principal);
  const [fetching, setFetching] = useState(false);

  const upload = useCallback(
    async ({ file, name = file.name, prefix = '' }: UploadProps) => {
      const computedPrefix = prefix.replace(/^\//, '').trim();
      const key = encodeURI(`${computedPrefix ? `/${computedPrefix}` : ''}/${name}`);

      setFetching(true);
      const from = Date.now();

      try {
        const payload = { key, source: [] };
        const { batch_id } = await canister.create_batch({
          key: payload.key,
          content_type: file.type,
        });

        const numberOfChunks = Math.ceil(file.size / chunkSize);
        const numberOfOperations = Math.ceil(numberOfChunks / chunksPerOperation);
        console.log({ numberOfChunks, numberOfOperations });

        let stats: Stats = {
          uploaded: 0,
          of: numberOfChunks,
        };
        progress(stats);

        let start = 0;
        const chunk_ids: bigint[] = [];

        // FIXME чанки перемешиваются на выдаче - понять последовательность невозможно,
        // поэтому пока-что грузим чанки последовательно
        // чтобы параллельная загрузка работала, нужно чанки просто грузить
        // и делать в конце commit_batch([1, 2, 4, 3, 5])
        // и передавать туда правльную последовательность чанков (как в CA)
        // либо просто применить консистентное API с CA
        while (chunk_ids.length != numberOfChunks) {
          if (start >= file.size) {
            break;
          }
          const end = start + chunkSize;
          const chunk = file.slice(start, end);
          const buffer = await chunk.arrayBuffer();
          const uintarr = new Uint8Array(buffer);
          const content = [...uintarr];
          const { chunk_id } = await canister.create_chunk({ batch_id, content });

          start = start + chunkSize;
          stats.uploaded += 1;
          progress({ ...stats });

          chunk_ids.push(chunk_id);
        }

        // while (chunk_ids.length != numberOfChunks) {
        //   const chunksPerOperationArr = Array(chunksPerOperation).fill(undefined);

        //   const results = await Promise.all(
        //     chunksPerOperationArr.map(async (_, index) => {
        //       const localStart = start + chunkSize * index;
        //       if (localStart >= file.size) {
        //         return null;
        //       }

        //       const end = start + chunkSize * (index + 1);
        //       const chunk = file.slice(localStart, end);

        //       const buffer = await chunk.arrayBuffer();
        //       const uintarr = new Uint8Array(buffer);
        //       const content = [...uintarr];

        //       const { chunk_id } = await canister.create_chunk({ batch_id, content });
        //       stats.uploaded += 1;

        //       progress({ ...stats });

        //       return { chunk_id };
        //     }),
        //   );

        //   start = start + chunkSize * results.filter((r) => r).length;

        //   results.forEach((chunkRes) => {
        //     if (!chunkRes) {
        //       return;
        //     }

        //     const { chunk_id } = chunkRes;
        //     chunk_ids.push(chunk_id);
        //   });
        // }

        console.log('!!!', chunk_ids);

        await canister.lock_batches({
          batch_ids: [batch_id],
        });
      } catch (e) {
        console.error(e);
        setFetching(false);
        throw e;
      }

      const to = Date.now();
      const duration = to - from;
      console.log(`Time result ${duration / 1000} s = ${duration / 1000 / 60} m`);
      setFetching(false);
    },
    [setFetching],
  );

  return {
    fetching,
    upload,
  };
};
