import React, { useCallback } from 'react';
import styled from 'styled-components';
import { ExecuteResponse } from 'wallet-ts';
import { ExecutorForm } from './ExecutorForm';
import { ExecutorFormData, ExecutorContextData } from './types';

const Container = styled.div``;

export interface ExecutorProps extends ExecutorContextData, IClassName {
  data?: Partial<ExecutorFormData>;
}

export function Executor({
  canisterId,
  data = {
    title: '',
    description: '',
    program: [],
  },
  ...p
}: ExecutorProps) {
  const handleSubmit = useCallback((response: ExecuteResponse) => {
    console.log('EXECUTED', response);
  }, []);

  return (
    <Container {...p}>
      <ExecutorForm canisterId={canisterId} data={data} onSubmit={handleSubmit} />
    </Container>
  );
}
