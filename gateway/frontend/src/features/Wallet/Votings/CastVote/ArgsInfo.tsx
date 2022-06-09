import { Principal } from '@dfinity/principal';
import React from 'react';
import styled from 'styled-components';
import { RemoteCallArgs } from 'union-ts';

const Container = styled.div`
  display: flex;
  flex-direction: column;

  & > *:not(:last-child) {
    margin-bottom: 8px;
  }
`;

export interface ArgsInfoProps {
  className?: string;
  style?: React.CSSProperties;
  args: RemoteCallArgs;
  canisterId: Principal;
  unionId: Principal;
  methodName: string;
}

export const ArgsInfo = styled(({ args, canisterId, methodName, unionId, ...p }: ArgsInfoProps) => {
  console.log(p);
  return <Container {...p}>Args info</Container>;
})``;
