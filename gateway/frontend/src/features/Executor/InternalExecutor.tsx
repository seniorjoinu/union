import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ExecutorFormData } from './types';
import { parseMessage } from './utils';
import { Executor, ExecutorProps } from './component';

export type InternalExecutorProps = Omit<ExecutorProps, 'data'>;

export const InternalExecutor = (props: InternalExecutorProps) => {
  const location = useLocation();
  const nav = useNavigate();
  const [data, setData] = useState<Partial<ExecutorFormData> | undefined>(undefined);

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

  if (!data) {
    return <span>Waiting data...</span>;
  }

  return <Executor {...props} data={data} />;
};
