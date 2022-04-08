import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { Text, SubmitButton as B } from 'components';
import { useWallet } from 'services';
import { useCurrentWallet } from '../context';
import { useBatches } from '../useBatches';
import { useBatchDownloader } from '../useBatchDownloader';
import { BatchUploader as BU } from './BatchUploader';
import { BatchSender as BS } from './BatchSender';

const DeleteButton = styled(B)`
  color: red;
`;
const DownloadButton = styled(B)``;
const LockButton = styled(B)``;
const Button = styled(B)``;
const BatchUploader = styled(BU)``;
const BatchSender = styled(BS)<{ visible: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 32px;
  border-top: 1px solid grey;
  transform: ${({ visible }) => (visible ? 'translateY(0)' : 'translateY(100%)')};
  transition: transform 0.3s ease;
  z-index: 3;
  background: white;
`;

const Title = styled(Text)``;

const Item = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 8px;
  border: 1px solid grey;

  & > *:not(:last-child) {
    margin-bottom: 8px;
  }
`;

const Controls = styled.div`
  display: flex;
  flex-direction: row;

  & > *:not(:last-child) {
    margin-right: 8px;
  }
`;

const Items = styled.div`
  display: flex;
  flex-direction: column;

  & > *:not(:last-child) {
    margin-bottom: 24px;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;

  ${Title} {
    margin-bottom: 64px;
  }

  ${BatchUploader} {
    margin-bottom: 32px;
  }

  ${Button} {
    margin-bottom: 24px;
    align-self: flex-end;
  }
`;

export interface AssetsProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Assets = ({ ...p }: AssetsProps) => {
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const { principal } = useCurrentWallet();
  const { canister, fetching, data } = useWallet(principal);
  const { remove } = useBatches();
  const { download } = useBatchDownloader();

  useEffect(() => {
    canister.get_batches();
  }, []);

  const handleDelete = useCallback(
    async (id: bigint) => {
      await canister.delete_unlocked_batches({ batch_ids: [id] });
      await canister.get_batches();
    },
    [canister, remove],
  );

  const handleExecuteDelete = useCallback(
    async (id: bigint) => {
      remove([id]);
    },
    [canister, remove],
  );

  const handleLock = useCallback(
    async (id: bigint) => {
      await canister.lock_batches({ batch_ids: [id] });
      await canister.get_batches();
    },
    [canister],
  );

  const batches = data.get_batches?.batches || [];

  const selectedIds = useMemo(
    () =>
      Object.entries(selected)
        .filter(([, value]) => !!value)
        .map(([id]) => BigInt(id)),
    [selected],
  );

  return (
    <Container {...p}>
      <Title variant='h2'>Asset batches</Title>
      <Button forwardedAs={NavLink} to='canister'>
        Create/update canisters
      </Button>
      <BatchUploader onUploaded={() => canister.get_batches()} />
      <BatchSender visible={!!selectedIds.length} batchIds={selectedIds} />
      {!!fetching.get_batches && <Text>fetching</Text>}
      {!fetching.get_batches && !batches.length && <Text>Batches does not exist</Text>}
      {!!batches.length && (
        <Items>
          {batches.map(([id, batch]) => (
            <Item key={id.toString()}>
              {/* FIXME refactoring + optimization */}
              <input
                type='checkbox'
                onChange={(e) =>
                  setSelected((selected) => ({ ...selected, [Number(id)]: !selected[Number(id)] }))
                }
                value={selected[Number(id)] as any}
              />
              <Text>ID: {id.toString()}</Text>
              <Text>Key: {batch.key}</Text>
              <Text>Content type: {batch.content_type}</Text>
              {!!batch.chunk_ids.length && <Text>Chunk ids: {batch.chunk_ids.join()}</Text>}
              <Text>Locked: {String(batch.locked)}</Text>
              <Controls>
                {!batch.locked ? (
                  <>
                    <LockButton onClick={() => handleLock(id)}>Lock</LockButton>
                    <DeleteButton onClick={() => handleDelete(id)}>Delete</DeleteButton>
                  </>
                ) : (
                  <DeleteButton onClick={() => handleExecuteDelete(id)}>
                    Execute delete
                  </DeleteButton>
                )}
                <DownloadButton onClick={() => download({ batch })}>Download</DownloadButton>
                {/* TODO check access for visibility */}
              </Controls>
            </Item>
          ))}
        </Items>
      )}
    </Container>
  );
};
