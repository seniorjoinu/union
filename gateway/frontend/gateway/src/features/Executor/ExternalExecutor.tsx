import React, { useCallback } from 'react';
import { ExecuteResponse } from 'wallet-ts';
import { useClient } from '../useClient';
import { parseMessage } from './utils';
import { Executor, ExecutorProps } from './component';

export type ExternalExecutorProps = Omit<ExecutorProps, 'data' | 'onSuccess'> & {
  redirectToHistory?(): void;
};

export const ExternalExecutor = ({ redirectToHistory, ...props }: ExternalExecutorProps) => {
  const { data, success } = useClient({ parser: parseMessage });

  const handleSuccess = useCallback(
    (payload: ExecuteResponse) => {
      success(payload).then(() => {
        redirectToHistory && redirectToHistory();
      });
    },
    [success, redirectToHistory],
  );

  if (!data) {
    return <span>Waiting data...</span>;
  }

  return <Executor {...props} data={data} onSuccess={handleSuccess} />;
};
