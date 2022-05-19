import { Principal } from '@dfinity/principal';
import { useCallback } from 'react';
import { CreatePermissionRequest, PermissionTarget } from 'union-ts';
import { useCurrentUnion } from '../../context';
import { FormData } from './types';

export interface UseCreateProps {
  getValues(): FormData;
}

export const useCreate = ({ getValues }: UseCreateProps) => {
  const { principal } = useCurrentUnion();

  const getCreatePermissionPayload = useCallback((): CreatePermissionRequest => {
    const values = getValues();

    const targets: PermissionTarget[] = values.targets.map((t) => {
      if (!t.canisterId) {
        return { SelfEmptyProgram: null };
      }
      return {
        Endpoint: {
          canister_id: Principal.fromText(t.canisterId),
          method_name: t.methodName || '*',
        },
      };
    });

    return {
      name: values.name,
      description: values.description,
      targets,
    };
  }, [getValues, principal]);

  return {
    getCreatePermissionPayload,
  };
};
