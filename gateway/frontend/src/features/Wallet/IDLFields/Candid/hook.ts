import React, { useCallback, useMemo } from 'react';
import { IDL } from '@dfinity/candid';
import { Principal } from '@dfinity/principal';
import { TId, TProg } from '@union/candid-parser';
import { useRender } from '../../../IDLRenderer';

export interface UseCandidArgsProps {
  canisterId: Principal;
  methodName: string;
  tupleTypes?: 'argTypes' | 'retTypes';
  name?: string;
}

export const useCandidArgs = ({
  methodName,
  canisterId,
  tupleTypes = 'argTypes',
  name = 'arguments',
}: UseCandidArgsProps) => {
  const getType = useCallback(
    (prog: TProg) => {
      const actor = prog.getIdlActor();
      const func = actor?._fields.find((v) => v[0] == methodName);

      if (!func) {
        return undefined;
      }

      const tuple = IDL.Tuple(...func[1][tupleTypes]);

      return {
        argTypes: func[1].argTypes,
        retTypes: func[1].retTypes,
        record: IDL.Record({ [name]: tuple }),
        tuple,
      };
    },
    [name, tupleTypes, methodName],
  );
  const type = useCallback(
    (prog: TProg): TId | IDL.Type<any> | undefined => getType(prog)?.record,
    [getType],
  );
  const view = useRender<any>({
    canisterId,
    type,
  });
  const form = useRender<any>({
    canisterId,
    type,
  });

  const tupleType = useMemo(() => {
    if (!view.prog) {
      return null;
    }
    const type = getType(view.prog);

    if (!type) {
      return null;
    }

    return type;
  }, [view.prog, getType]);

  const decode = useCallback(
    (value: ArrayBuffer | null | undefined, types?: IDL.Type<any>[]) => {
      if (!types || !tupleType || !value) {
        return null;
      }
      try {
        return IDL.decode(types, value);
      } catch (e) {}
      return null;
    },
    [tupleType],
  );

  return {
    view,
    form,
    type: tupleType,
    decode,
  };
};
