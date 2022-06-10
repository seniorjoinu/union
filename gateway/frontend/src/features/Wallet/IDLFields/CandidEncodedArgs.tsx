import { IDL, JsonValue } from '@dfinity/candid';
import { Principal } from '@dfinity/principal';
import { TId, TProg } from '@union/candid-parser';
import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { RemoteCallArgs } from 'union-ts';
import { useRender } from '../../IDLRenderer';

const Container = styled.div`
  display: flex;
  flex-direction: column;

  & > *:not(:last-child) {
    margin-bottom: 8px;
  }
`;

export interface CandidEncodedArgsProps {
  className?: string;
  style?: React.CSSProperties;
  args: RemoteCallArgs;
  canisterId: Principal;
  unionId: Principal;
  methodName: string;
}

export const CandidEncodedArgs = styled(
  ({ args, canisterId, methodName, unionId, ...p }: CandidEncodedArgsProps) => {
    const getType = useCallback(
      (prog: TProg) => {
        const actor = prog.getIdlActor();
        const func = actor?._fields.find((v) => v[0] == methodName);

        if (!func) {
          return undefined;
        }

        const tuple = IDL.Tuple(...func[1].argTypes);

        return { argTypes: func[1].argTypes, record: IDL.Record({ arguments: tuple }), tuple };
      },
      [methodName],
    );
    const type = useCallback(
      (prog: TProg): TId | IDL.Type<any> | undefined => getType(prog)?.record,
      [getType],
    );
    const { View, prog } = useRender<any>({
      canisterId,
      type,
    });

    const tupleType = useMemo(() => {
      if (!prog) {
        return null;
      }
      const type = getType(prog);

      if (!type) {
        return null;
      }

      return type;
    }, [prog, getType]);

    const decoded = useMemo(() => {
      if ('CandidString' in args || !tupleType) {
        return null;
      }

      let decoded: JsonValue[] | null = null;

      try {
        decoded = IDL.decode(tupleType.argTypes, Buffer.from(args.Encoded));
      } catch (e) {}

      return decoded;
    }, [tupleType, args]);

    if (!tupleType?.argTypes.length || !decoded) {
      return null;
    }

    if ('CandidString' in args) {
      return <Container {...p}>CandidString not implemented</Container>;
    }

    return (
      <Container {...p}>
        <View value={{ arguments: decoded }} />
      </Container>
    );
  },
)``;
