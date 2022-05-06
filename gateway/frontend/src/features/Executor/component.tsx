import React from 'react';
import styled from 'styled-components';
import { ExecuteResponse } from 'union-ts';
import { ExecutorForm } from './ExecutorForm';
import { ExecutorFormData, ExecutorContextData } from './types';

const Container = styled.div``;

const defaultData: Partial<ExecutorFormData> = {
  title: '',
  description: '',
  authorization_delay_nano: 1 * 60 * 60 * 10 ** 9, // 1 hour in nano
  program: [],
};

export interface ExecutorProps extends ExecutorContextData, IClassName {
  mode?: 'edit' | 'view';
  data?: Partial<ExecutorFormData>;
  onSuccess?(response: ExecuteResponse): void;
  renderResult?(index: number): React.ReactNode | null | void;
}

export function Executor({
  canisterId,
  onSuccess = () => undefined,
  data = defaultData,
  mode = 'edit',
  renderResult,
  ...p
}: ExecutorProps) {
  const extendedData = { ...defaultData, ...data };

  return (
    <Container {...p}>
      <ExecutorForm
        canisterId={canisterId}
        data={extendedData}
        mode={mode}
        onSubmit={onSuccess}
        renderResult={renderResult}
      />
    </Container>
  );
}
