import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { ExecuteResponse } from 'wallet-ts';
import { ExecutorForm } from './ExecutorForm';
import { ExecutorFormData, ExecutorContextData } from './types';

const Container = styled.div``;

export interface ExecutorProps extends ExecutorContextData, IClassName {}

export function Executor({ canisterId, ...p }: ExecutorProps) {
  const [data, setData] = useState<Partial<ExecutorFormData>>({
    title: '',
    description: '',
    program: [],
  });

  const handler = useCallback((e: MessageEvent<any>) => {
    if (!e.data || e.data.target != 'wallet-executor') {
      return;
    }
    console.log(e.data);

    const data = parseMessage(e.data.payload);

    if (data) {
      setData(data);
    }
  }, []);

  useEffect(() => {
    window.parent.postMessage({ origin: 'wallet-executor', type: 'ready', args: [] }, '*');

    window.addEventListener('message', handler);
    return () => {
      window.removeEventListener('message', handler);
    };
  }, []);

  const handleSubmit = useCallback((response: ExecuteResponse) => {
    console.log(response);
  }, []);

  return (
    <Container {...p}>
      <ExecutorForm canisterId={canisterId} data={data} onSubmit={handleSubmit} />
    </Container>
  );
}

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
