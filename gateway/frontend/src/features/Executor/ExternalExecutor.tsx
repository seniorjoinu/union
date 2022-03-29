import React, { useCallback, useEffect, useState } from 'react';
import { ExecutorFormData } from './types';
import { parseMessage } from './utils';
import { Executor, ExecutorProps } from './component';

export type ExternalExecutorProps = Omit<ExecutorProps, 'data' | 'onSuccess'>;

export const ExternalExecutor = (props: ExternalExecutorProps) => {
  const [data, setData] = useState<Partial<ExecutorFormData> | undefined>(undefined);

  const handler = useCallback((e: MessageEvent<any>) => {
    if (!e.data || e.data.target != 'wallet-executor') {
      return;
    }
    const data = parseMessage(e.data.payload);

    if (data) {
      setData(data);
    }
  }, []);

  const handleSuccess = useCallback(() => {
    window.close();
  }, []);

  useEffect(() => {
    window.parent.postMessage({ origin: 'wallet-executor', type: 'ready', args: [] }, '*');

    window.addEventListener('message', handler);
    return () => {
      window.removeEventListener('message', handler);
    };
  }, []);

  if (!data) {
    return <span>Waiting data...</span>;
  }

  return <Executor {...props} data={data} onSuccess={handleSuccess} />;
};
