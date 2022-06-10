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

export interface CandidEncodedArgsProps extends UseCandidArgsProps {
  className?: string;
  style?: React.CSSProperties;
  args: RemoteCallArgs;
}

export const CandidEncodedArgs = styled(
  ({ args, canisterId, methodName, ...p }: CandidEncodedArgsProps) => {
    const { decode, view, type } = useCandidArgs({ canisterId, methodName, name: 'arguments' });

    const decoded = useMemo(() => {
      if ('CandidString' in args) {
        return null;
      }

      return decode(Buffer.from(args.Encoded), type?.argTypes);
    }, [decode, args, type]);

    if (!type?.argTypes.length || !decoded) {
      return null;
    }

    if ('CandidString' in args) {
      return <Container {...p}>CandidString not implemented</Container>;
    }

    return (
      <Container {...p}>
        <view.View value={{ arguments: decoded }} />
      </Container>
    );
  },
)``;
