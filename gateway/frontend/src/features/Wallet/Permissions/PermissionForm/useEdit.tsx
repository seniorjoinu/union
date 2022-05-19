import React, { useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTrigger } from 'toolkit';
import { useUnion } from 'services';
import { PermissionTarget, UpdatePermissionRequest } from 'union-ts';
import { Principal } from '@dfinity/principal';
import { parsePermission } from '../../utils';
import { useCurrentUnion } from '../../context';
import { FormData } from './types';

export interface UseEditProps {
  setValue(name: string, value: any): void; // FIXME
  getValues(): FormData;
}

export const useEdit = ({ setValue, getValues }: UseEditProps) => {
  const { permissionId } = useParams();
  const { principal } = useCurrentUnion();
  const { canister, fetching, data } = useUnion(principal);

  useEffect(() => {
    if (!permissionId) {
      return;
    }

    canister.get_permission({ id: BigInt(permissionId) });
  }, [setValue, permissionId]);

  useTrigger(
    ({ permission }) => {
      const parsed = parsePermission(permission);
      const targets = parsed.targets.map((t) => ({
        canisterId: t.canisterId || '',
        methodName: t.method || '',
      }));

      setValue('name', parsed.name);
      setValue('description', parsed.description);
      setValue('targets', targets);
    },
    data.get_permission,
    [data.get_permission, setValue],
  );

  const permission = data.get_permission?.permission;

  const getUpdatePermissionPayload = useCallback((): UpdatePermissionRequest => {
    if (!permissionId || !permission) {
      return {
        id: BigInt(permissionId || -1),
        new_name: [],
        new_description: [],
        new_targets: [],
      };
    }
    const old = parsePermission(permission);

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
      id: BigInt(permissionId),
      new_name: old.name !== values.name ? [values.name] : [],
      new_description: old.description !== values.description ? [values.description] : [],
      new_targets: [targets], // TODO make check of change
    };
  }, [getValues, permission]);

  let fallback: JSX.Element | null = null;

  if (!permissionId) {
    fallback = <span>PermissionId is empty</span>;
  }

  if (fetching.get_permission) {
    fallback = <span>fetching</span>;
  }

  if (!data.get_permission?.permission) {
    fallback = <span>Permission does not found</span>;
  }

  return {
    fallback,
    getUpdatePermissionPayload,
  };
};
