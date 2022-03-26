import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ExecutorFormData } from './types';
import { Executor, ExecutorProps } from './component';

export type ExternalExecutorProps = Omit<ExecutorProps, 'data'>;

export const ExternalExecutor = (props: ExternalExecutorProps) => {
  const location = useLocation();
  const nav = useNavigate();
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

  return <Executor {...props} data={data} />;
};

const parseMessage = (data: any): Partial<ExecutorFormData> | null => {
  if (!data) {
    return null;
  }

  const result: Partial<ExecutorFormData> = {
    title: data.title ? String(data.title) : '',
    description: data.description ? String(data.description) : '',
  };

  if (
    data.rnp
    && typeof data.rnp == 'object'
    && 'role_id' in data.rnp
    && 'permission_id' in data.rnp
  ) {
    const roleId = Number(data.rnp.role_id);
    const permissionId = Number(data.rnp.permission_id);

    if (!Number.isNaN(roleId) && !Number.isNaN(permissionId)) {
      result.rnp = { role_id: roleId, permission_id: permissionId };
    }
  }

  if (data.program && Array.isArray(data.program)) {
    const program = data.program
      .filter(
        (p: any) =>
          !!p
          && 'endpoint' in p
          && !!p.endpoint
          && !!p.endpoint.canister_id
          && !!p.endpoint.method_name,
      )
      .map((p: any) => ({
        endpoint: {
          canister_id: String(p.endpoint.canister_id),
          method_name: String(p.endpoint.method_name),
        },
        cycles: !Number.isNaN(Number(p.cycles)) ? String(p.cycles) : '',
        args_candid: Array.isArray(p.args_candid)
          ? p.args_candid.filter((a: any) => typeof a == 'string')
          : [],
      }));

    result.program = program;
  }

  return result;
};
