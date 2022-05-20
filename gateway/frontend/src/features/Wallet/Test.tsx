import { Column } from '@union/components';
import React from 'react';
import styled from 'styled-components';
import { Permission } from 'union-ts';
import { useRender } from '../IDLRenderer';
import { useCurrentUnion } from './context';

const Portal = styled(Column)`
  * {
    display: flex;
    flex-direction: column;

    & > *:not(:last-child) {
      margin-bottom: 8px;
    }
  }
`;
const Container = styled(Column)`
  display: flex;
  flex-direction: column;

  & > *:not(:last-child) {
    margin-bottom: 8px;
  }
`;

export interface TestProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Test = styled(({ ...p }: TestProps) => {
  const { principal } = useCurrentUnion();
  const { Editor, Viewer } = useRender({ canisterId: principal, type: 'ThresholdValue' });

  const value: Permission = {
    id: [BigInt(0)],
    name: 'Test permission',
    description: 'test description',
    targets: [
      { Endpoint: { canister_id: principal, method_name: 'get_groups' } },
      { SelfEmptyProgram: null },
    ],
  };

  return (
    <Container {...p}>
      <Portal id='editor'>
        <Editor selector='#editor' />
      </Portal>
      <Portal id='viewer'>
        <Viewer value={value} selector='#viewer' />
      </Portal>
    </Container>
  );
})``;
