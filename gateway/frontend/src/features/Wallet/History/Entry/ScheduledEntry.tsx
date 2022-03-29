import React from 'react';
import { useParams } from 'react-router-dom';
import { useTrigger } from 'toolkit';
import { useWallet } from 'services';
import { useCurrentWallet } from '../../context';
import { Entry } from './Entry';

export interface ScheduledEntryProps {
  className?: string;
  style?: React.CSSProperties;
}

export const ScheduledEntry = (p: ScheduledEntryProps) => {
  const { taskId } = useParams();
  const { rnp, principal } = useCurrentWallet();
  const { canister, fetching, data } = useWallet(principal);

  useTrigger(
    (rnp) => {
      if (!taskId) {
        return;
      }
      canister.get_scheduled_for_authorization_executions({ task_ids: [[BigInt(taskId)]], rnp });
    },
    rnp,
    [taskId],
  );

  const [, entry] = (data.get_scheduled_for_authorization_executions?.entries || [])[0];

  if (!taskId) {
    return <span>Entry with taskId={taskId} does not found</span>;
  }

  if (fetching.get_scheduled_for_authorization_executions) {
    return <span>Fetching...</span>;
  }

  if (!entry) {
    return <span>Entry with taskId={taskId} does not exist</span>;
  }

  return <Entry {...p} entry={entry} />;
};
