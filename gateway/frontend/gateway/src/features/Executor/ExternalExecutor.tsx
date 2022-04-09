import React, { useCallback, useEffect, useState } from 'react';
import { ExecutorFormData } from './types';
import { parseMessage } from './utils';
import { Executor, ExecutorProps } from './component';

export type ExternalExecutorProps = Omit<ExecutorProps, 'data' | 'onSuccess'> & {
  redirectToHistory?(): void;
};

export const ExternalExecutor = ({ redirectToHistory, ...props }: ExternalExecutorProps) => {
  const [data, setData] = useState<Partial<ExecutorFormData> | undefined>(undefined);
  const [opts, setOpts] = useState<{ after?: 'close' } | undefined>(undefined);

  const handler = useCallback((e: MessageEvent<any>) => {
    if (!e.data || e.data.target != 'wallet-executor') {
      return;
    }
    setOpts(e.data.options);

    const data = parseMessage(e.data.payload);

    if (data) {
      setData(data);
    }
  }, []);

  const handleSuccess = useCallback(() => {
    switch (opts?.after) {
      case 'close': {
        window.close();
        break;
      }
      default: {
        redirectToHistory && redirectToHistory();
      }
    }
  }, [opts, redirectToHistory]);

  useEffect(() => {
    window.opener?.postMessage({ origin: 'wallet-executor', type: 'ready', args: [] }, '*');

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
