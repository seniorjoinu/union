import React, { useMemo } from 'react';
import { ViewerSettings } from 'src/features/IDLRenderer';
import styled from 'styled-components';
import { RemoteCallArgs } from 'union-ts';
import { getRules } from '../rules';
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

    const settings = useMemo(
      (): ViewerSettings<any> => ({
        rules: getRules(),
      }),
      [],
    );

    if (!type?.argTypes.length || !decoded) {
      return null;
    }

    if ('CandidString' in args) {
      return <Container {...p}>CandidString not implemented</Container>;
    }

    return (
      <Container {...p}>
        <view.View value={{ arguments: decoded }} settings={settings} />
      </Container>
    );
  },
)``;
