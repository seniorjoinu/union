import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { PageWrapper, Text, SubmitButton as B } from '@union/components';
import { useUnion } from 'services';
import deleteIcon from '../../../assets/delete.svg';
import { useCurrentUnion } from '../context';
import { useBatches } from '../useBatches';
import { useBatchDownloader } from '../useBatchDownloader';
import { BatchSender as BS } from './BatchSender';
import { useCreateAssetsCanister } from './useSpawnCanister';

const DeleteButton = styled(B)`
  color: red;
`;
const DeleteIcon = styled.img`
  cursor: pointer;

  &[aria-disabled='true'] {
    opacity: 0.5;
    pointer-events: none;
  }
`;
const DownloadButton = styled(B)``;
const LockButton = styled(B)``;
const Button = styled(B)``;
const BatchSender = styled(BS)<{ visible: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 32px;
  border-top: 1px solid ${({ theme }) => theme.colors.grey};
  transform: ${({ visible }) => (visible ? 'translateY(0)' : 'translateY(100%)')};
  transition: transform 0.3s ease;
  z-index: 3;
  background: ${({ theme }) => theme.colors.light};
`;

const Item = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 8px;
  border: 1px solid ${({ theme }) => theme.colors.grey};

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

const Buttons = styled(Controls)`
  justify-content: flex-end;
`;
const SelectControls = styled(Controls)`
  padding: 0 8px;
  justify-content: space-between;
`;

const Items = styled.div`
  display: flex;
  flex-direction: column;

  & > *:not(:last-child) {
    margin-bottom: 24px;
  }
`;

const Container = styled(PageWrapper)`
  ${SelectControls} {
    margin-bottom: 24px;
  }
  ${Buttons} {
    margin-bottom: 24px;
  }
`;

export interface AssetsProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Assets = ({ ...p }: AssetsProps) => {
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const { principal } = useCurrentUnion();
  const { canister, fetching, data } = useUnion(principal);
  const { createCanister } = useCreateAssetsCanister();
  const { remove } = useBatches();
  const { download } = useBatchDownloader();

  useEffect(() => {
    getBatches();
  }, []);

  // TODO paging
  const getBatches = useCallback(
    () =>
      canister.list_batches({
        page_req: {
          page_size: 100,
          page_index: 0,
          sort: null,
          filter: null,
        },
      }),
    [],
  );

  const handleDelete = useCallback(
    async (id: bigint) => {
      await canister.delete_unlocked_batches({ ids: [id] });
      await getBatches();
    },
    [canister, remove, getBatches],
  );

  const handleExecuteDelete = useCallback(
    async (id: bigint) => {
      remove([id]);
    },
    [canister, remove],
  );

  const handleLock = useCallback(
    async (id: bigint) => {
      await canister.lock_batches({ ids: [id] });
      await getBatches();
    },
    [canister, getBatches],
  );

  const batches = useMemo(
    () =>
      [...(data.list_batches?.page.data || [])].sort((a, b) => Number(b.id[0]) - Number(a.id[0])),
    [data.list_batches?.page.data],
  );

  const selectedIds = useMemo(
    () =>
      Object.entries(selected)
        .filter(([, value]) => !!value)
        .map(([id]) => BigInt(id)),
    [selected],
  );

  return (
    <Container {...p} title='Asset batches'>
      <Buttons>
        <Button forwardedAs={NavLink} to='create-batch'>
          + Create batch
        </Button>
        <Button onClick={createCanister}>+ Create canister</Button>
        <Button forwardedAs={NavLink} to='install-code'>
          Install wasm to canister
        </Button>
      </Buttons>
      <SelectControls>
        <input
          type='checkbox'
          onChange={(e) =>
            setSelected(() =>
              (selectedIds.length
                ? {}
                : batches.reduce((acc, next) => ({ ...acc, [Number(next.id[0])]: true }), {})),
            )
          }
          checked={!!selectedIds.length}
        />
        <DeleteIcon
          src={deleteIcon}
          alt='delete'
          aria-disabled={!selectedIds.length}
          onClick={() => remove(selectedIds.map((s) => BigInt(s)))}
        />
      </SelectControls>
      {!!fetching.list_batches && <Text>fetching</Text>}
      {!fetching.list_batches && !batches.length && <Text>Batches does not exist</Text>}
      {!!batches.length && (
        <Items>
          {batches.map((batch) => {
            const id = batch.id[0] || BigInt(0);

            return (
              <Item key={id.toString()}>
                {/* FIXME refactoring + optimization */}
                <input
                  type='checkbox'
                  onChange={(e) =>
                    setSelected((selected) => ({
                      ...selected,
                      [Number(id)]: !selected[Number(id)],
                    }))
                  }
                  checked={!!selected[Number(id)]}
                />
                <Text>ID: {id.toString()}</Text>
                <Text>Key: {batch.key}</Text>
                <Text>Content type: {batch.content_type}</Text>
                {/* {!!batch.chunk_ids.length && <Text>Chunk ids: {batch.chunk_ids.join()}</Text>} */}
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
            );
          })}
        </Items>
      )}
      <BatchSender visible={!!selectedIds.length} batchIds={selectedIds} />
    </Container>
  );
};
