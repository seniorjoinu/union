import React, { useCallback } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { useTrigger } from 'toolkit';
import { Button as B } from 'components';
import { useWallet } from 'services';
import { useCurrentWallet } from '../../context';
import { Entry } from './Entry';

const AproveButton = styled(B)``;
const Controls = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 16px;

  & > *:not(:last-child) {
    margin-right: 8px;
  }
`;

export interface ScheduledEntryProps {
  className?: string;
  style?: React.CSSProperties;
  navigateToEntry(entryId: string): void;
}

export const ScheduledEntry = ({ navigateToEntry, ...p }: ScheduledEntryProps) => {
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

  const authorizeExecution = useCallback(async () => {
    if (fetching.authorize_execution || !taskId) {
      return;
    }

    const result = await canister.authorize_execution({ task_id: BigInt(taskId) });

    if ('Executed' in result) {
      return navigateToEntry(String(result.Executed));
    }

    if (!rnp) {
      return;
    }
    canister.get_scheduled_for_authorization_executions({ task_ids: [[BigInt(taskId)]], rnp });
  }, [canister, fetching.authorize_execution, taskId, rnp, navigateToEntry]);

  const entryInfo = (data.get_scheduled_for_authorization_executions?.entries || [])[0];

  if (!taskId) {
    return <span>Entry with taskId={taskId} does not found</span>;
  }

  if (fetching.get_scheduled_for_authorization_executions) {
    return <span>Fetching...</span>;
  }

  if (!entryInfo) {
    return <span>Entry with taskId={taskId} does not exist</span>;
  }

  return (
    <Entry
      {...p}
      entry={entryInfo[1]}
      renderControls={({ isPending, entryAuthorizedByMe, hasAccess }) => {
        const approveVisible = isPending && !entryAuthorizedByMe && hasAccess;

        return (
          <Controls>
            {approveVisible && (
              <AproveButton onClick={authorizeExecution} disabled={!!fetching.authorize_execution}>
                Подтвердить
              </AproveButton>
            )}
          </Controls>
        );
      }}
    />
  );
};
