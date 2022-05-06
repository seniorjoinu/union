import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { PageWrapper, SubmitButton as B } from 'components';
import { NavLink as N } from 'react-router-dom';
import { HistoryEntry } from 'union-ts';
import { useUnion } from 'services';
import { useCurrentUnion } from '../context';
import { Item as I } from './Item';

const LoadMoreButton = styled(B)``;
const Button = styled(B)``;
const Item = styled(I)``;
const NavLink = styled(N)``;

const Container = styled(PageWrapper)`
  padding-bottom: 32px;

  ${NavLink} {
    text-decoration: none;
  }
  ${NavLink}:not(:last-child) {
    margin-bottom: 24px;
  }
  ${Button} {
    align-self: flex-end;
  }
  ${LoadMoreButton} {
    margin-top: 16px;
    align-self: center;
  }
`;

const DEFAULT_PAGE_SIZE = 5;

export interface HistoryProps extends IClassName {
  createLink?: string;
}

export function History({ createLink, ...p }: HistoryProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const { rnp, principal } = useCurrentUnion();
  const { canister, fetching, data } = useUnion(principal);

  useEffect(() => {
    canister.get_scheduled_for_authorization_executions({ task_ids: [] });
    canister.get_history_entry_ids();
  }, [canister]);

  const ids = useMemo(
    () => (data.get_history_entry_ids?.ids || []).sort((a, b) => Number(b) - Number(a)),
    [data.get_history_entry_ids?.ids],
  );

  const loadMore = useCallback(async () => {
    const slicedIds = ids.slice(history.length, history.length + DEFAULT_PAGE_SIZE);

    Promise.all(
      slicedIds.map((id) =>
        canister.get_history_entries({
          ids: [id],
        }),
      ),
    )
      .then((blocks) => blocks.map((b) => b.entries).flat())
      .then((entries) => setHistory((history) => [...history, ...entries]));
  }, [history, ids, setHistory]);

  useEffect(() => {
    loadMore();
  }, [ids]);

  const progress =
    !!fetching.get_history_entry_ids ||
    !!fetching.get_history_entries ||
    !!fetching.get_scheduled_for_authorization_executions;

  const scheduled = data.get_scheduled_for_authorization_executions?.entries || [];

  const entries: [bigint | null, HistoryEntry][] = useMemo(
    () =>
      [...scheduled, ...history.map<[bigint | null, HistoryEntry]>((entry) => [null, entry])].sort(
        (a, b) => Number(b[1].timestamp) - Number(a[1].timestamp),
      ),
    [scheduled, history],
  );

  return (
    <Container {...p} title='Execution history'>
      {!!createLink && !!rnp && (
        <Button forwardedAs={NavLink} to={createLink}>
          + Create execution
        </Button>
      )}
      {progress && <span>Fetching...</span>}
      {!progress && !entries.length && <span>History is empty</span>}
      {entries.map(([taskId, entry]) => (
        <NavLink
          key={String(entry.id)}
          to={taskId !== null ? `scheduled/${String(taskId)}` : String(entry.id)}
        >
          <Item entry={entry} />
        </NavLink>
      ))}
      {history.length < ids.length && <LoadMoreButton onClick={loadMore}>Load more</LoadMoreButton>}
    </Container>
  );
}