import React, { useMemo } from 'react';
import styled from 'styled-components';
import { RemoteCallArgs } from 'union-ts';
import { useCandidArgs, UseCandidArgsProps } from './hook';

const Container = styled.div`
  display: flex;
  flex-direction: column;

  & > *:not(:last-child) {
    margin-bottom: 8px;
  }
`;

export interface CandidEncodedResultProps extends UseCandidArgsProps {
  className?: string;
  style?: React.CSSProperties;
  value: ArrayBuffer;
}

export const CandidEncodedResult = styled(
  ({ value, canisterId, methodName, ...p }: CandidEncodedResultProps) => {
    const { decode, view, type } = useCandidArgs({
      canisterId,
      methodName,
      tupleTypes: 'retTypes',
      name: 'result',
    });

    const decoded = useMemo(() => decode(value, type?.retTypes), [decode, value, type]);

    if (!type?.retTypes.length || !decoded) {
      return null;
    }

    return (
      <Container {...p}>
        <view.View value={{ result: decoded }} />
      </Container>
    );
  },
)``;
