import React, { useCallback, useEffect, useState } from 'react';

export interface MessageData {
  origin: string;
  target: string;
  type: string;
  payload: any;
  options: { after?: 'close' };
}

export interface UseClientProps<T> {
  parser(payload: any): T;
}

export function useClient<T = any>({ parser }: UseClientProps<T>) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [opts, setOpts] = useState<{ after?: 'close' } | undefined>(undefined);

  const handler = useCallback((e: MessageEvent<MessageData>) => {
    if (
      !e.data ||
      e.data.origin != 'union-client' ||
      e.data.target != 'union' ||
      e.data.type !== 'send-data'
    ) {
      return;
    }
    setOpts(e.data.options);

    const data = parser(e.data.payload);

    if (data) {
      setData(data);
    }
  }, []);

  const success = useCallback(
    async (payload: any) => {
      const data: MessageData = {
        origin: 'union',
        target: 'union-client',
        type: 'done',
        payload,
        options: {},
      };

      window.opener?.postMessage(data, '*');

      switch (opts?.after) {
        case 'close': {
          window.close();
          return Promise.reject('Window is closing');
        }
      }
    },
    [opts],
  );

  useEffect(() => {
    const data: MessageData = {
      origin: 'union',
      target: 'union-client',
      type: 'ready',
      payload: null,
      options: {},
    };

    window.opener?.postMessage(data, '*');

    window.addEventListener('message', handler);

    return () => {
      window.removeEventListener('message', handler);
    };
  }, []);

  return {
    data,
    opts,
    success,
  };
}
