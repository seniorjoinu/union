import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useWallet } from 'services';
import { useCurrentWallet } from '../../context';
import { Entry } from './Entry';

export interface HistoryEntryProps {
  className?: string;
  style?: React.CSSProperties;
}

export const HistoryEntry = (p: HistoryEntryProps) => {
  const { entryId } = useParams();
  const { principal } = useCurrentWallet();
  const { canister, fetching, data } = useWallet(principal);

  useEffect(() => {
    if (!entryId) {
      return;
    }
    canister.get_history_entries({ ids: [BigInt(entryId)] });
  }, [entryId]);

  const entry = (data.get_history_entries?.entries || [])[0];

  if (!entryId) {
    return <span>Entry does not found {entryId}</span>;
  }

  if (fetching.get_history_entries) {
    return <span>Fetching...</span>;
  }

  if (!entry) {
    return <span>Entry does not exist {entryId}</span>;
  }

  return <Entry {...p} entry={entry} />;
};
