import React from 'react';
import styled from 'styled-components';
import { ExecuteResponse } from 'wallet-ts';
import { ExecutorForm } from './ExecutorForm';
import { ExecutorFormData, ExecutorContextData } from './types';

const Container = styled.div``;

export interface ExecutorProps extends ExecutorContextData, IClassName {
  mode?: 'edit' | 'view';
  data?: Partial<ExecutorFormData>;
  onSuccess?(response: ExecuteResponse): void;
}

export function Executor({
  canisterId,
  onSuccess = () => undefined,
  data = {
    title: '',
    description: '',
    program: [],
  },
  mode = 'edit',
  ...p
}: ExecutorProps) {
  return (
    <Container {...p}>
      <ExecutorForm canisterId={canisterId} data={data} mode={mode} onSubmit={onSuccess} />
    </Container>
  );
}
