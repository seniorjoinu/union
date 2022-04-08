import { useCallback, useState } from 'react';
import { useWallet } from 'services';
import { downloadFile } from 'toolkit';
import { Batch } from 'wallet-ts';
import { useCurrentWallet } from './context';

export interface DownloadProps {
  batch: Batch;
}

export const useBatchDownloader = () => {
  const { principal } = useCurrentWallet();
  const { canister } = useWallet(principal);
  const [fetching, setFetching] = useState(false);

  const download = useCallback(
    async ({ batch }: DownloadProps) => {
      setFetching(true);
      const from = Date.now();

      try {
        const splitted = batch.key.split('/');
        const name = splitted[splitted.length - 1];
        const contents = await Promise.all(
          [...batch.chunk_ids]
            .sort((a, b) => Number(a) - Number(b))
            .map(async (chunk_id) => (await canister.get_chunk({ chunk_id })).chunk_content),
        );

        const arr = new Uint8Array(contents.flat());
        const file = new File([arr], name, { type: batch.content_type });

        downloadFile(file);
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
    [setFetching, canister],
  );

  return {
    fetching,
    download,
  };
};
