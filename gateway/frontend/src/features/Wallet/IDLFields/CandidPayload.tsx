import React, { useCallback, useEffect, useMemo } from 'react';
import { IDL } from '@dfinity/candid';
import { Principal } from '@dfinity/principal';
import { TId, TProg } from '@union/candid-parser';
import { useTrigger } from 'toolkit';
import { useRender } from '../../IDLRenderer';

export interface CandidPayloadProps {
  className?: string;
  style?: React.CSSProperties;
  canisterId: Principal;
  methodName: string;
  value?: ArrayBuffer | null;
  onChange(value: ArrayBuffer | null): void;
}

export const CandidPayload = React.forwardRef<HTMLDivElement, CandidPayloadProps>(
  ({ value, onChange, canisterId, methodName, ...p }, ref) => {
    const getType = useCallback(
      (prog: TProg) => {
        const actor = prog.getIdlActor();
        const func = actor?._fields.find((v) => v[0] == methodName);

        if (!func) {
          return undefined;
        }

        const tuple = IDL.Tuple(...func[1].argTypes);

        return { record: IDL.Record({ arguments: tuple }), tuple };
      },
      [methodName],
    );
    const type = useCallback(
      (prog: TProg): TId | IDL.Type<any> | undefined => getType(prog)?.record,
      [getType],
    );
    const { Form, prog, defaultValues } = useRender<any>({
      canisterId,
      type,
    });

    const tupleType = useMemo(() => {
      if (!prog) {
        return null;
      }
      const tuple = getType(prog)?.tuple;

      if (!tuple) {
        return null;
      }

      // @ts-expect-error
      return { tuple, length: tuple?._fields.length || 0 };
    }, [prog, getType]);

    useEffect(() => {
      if (!tupleType?.length) {
        return onChange(new ArrayBuffer(0));
      }

      let buffer: ArrayBuffer | null = null;

      try {
        // @ts-expect-error
        buffer = IDL.encode(tupleType.tuple._components, defaultValues.arguments || []);
      } catch (e) {}

      onChange(value || buffer || null);
    }, [tupleType]);

    const defaultValue = useMemo(() => {
      if (!tupleType || !value) {
        return null;
      }
      try {
        // @ts-expect-error
        return IDL.decode(tupleType.tuple._components, value);
      } catch (e) {}
      return null;
    }, [value, tupleType?.tuple]);

    if (!tupleType?.length) {
      return null;
    }

    return (
      <Form
        onChange={(value, valid) => {
          if (!valid) {
            onChange(null);
            return;
          }

          // @ts-expect-error
          const buffer = IDL.encode(tupleType?.tuple._components, value.arguments);

          return onChange(buffer);
        }}
        defaultValue={{ arguments: defaultValue || [] }}
      />
    );
  },
);
