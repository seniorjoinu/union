import React, { useCallback, useEffect, useState } from 'react';
import type { Message, MessageData } from '@union/client';
import { useLocation, useNavigate } from 'react-router-dom';
import { normalizeValues } from './IDLRenderer';

export type { MessageData, Message } from '@union/client';

export interface UseClientProps<T> {
  parser(payload: any): T;
}

export function useClient<T = any>({ parser }: UseClientProps<T>) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [opts, setOpts] = useState<{ after?: 'close' } | undefined>(undefined);

  const handler = useCallback((e: MessageEvent<Message>) => {
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
      const data: Message = {
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
    const data: Message = {
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

export type ExternalFormProps = {
  redirectToHistory?(): void;
  children(data: MessageData, onSuccess: (p: any) => void): JSX.Element;
};

export const ExternalForm = ({ redirectToHistory, children }: ExternalFormProps) => {
  const { data, success } = useClient({ parser: parseMessage });

  const handleSuccess = useCallback(
    (payload: any) => {
      success(payload).then(() => {
        redirectToHistory && redirectToHistory();
      });
    },
    [success, redirectToHistory],
  );

  if (!data) {
    return <span>Waiting data...</span>;
  }

  return children(data, handleSuccess);
};

export type InternalFormProps = {
  required?: boolean;
  children(data?: MessageData): JSX.Element;
};

export const InternalForm = ({ children, required }: InternalFormProps) => {
  const location = useLocation();
  const nav = useNavigate();
  const [data, setData] = useState<MessageData | undefined>(undefined);

  useEffect(() => {
    if (!location.state) {
      return;
    }

    const data = parseMessage(location.state);

    if (data) {
      setData(data);
    }
    // location.state = null;
    nav(location.pathname, { replace: true, state: null });
  }, []);

  if (!data && required) {
    return <span>Waiting data...</span>;
  }

  return children(data);
};

export const parseMessage = (data: any): MessageData | null => {
  console.log('Received data', data);

  if (!data) {
    return null;
  }

  return normalizeValues(data as MessageData);
};
