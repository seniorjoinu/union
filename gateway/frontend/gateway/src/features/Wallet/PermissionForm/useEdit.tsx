import React, { useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTrigger } from 'toolkit';
import { useWallet, walletSerializer } from 'services';
import { PermissionScope, PermissionTarget } from 'wallet-ts';
import { Principal } from '@dfinity/principal';
import { parsePermission } from '../utils';
import { useCurrentWallet } from '../context';
import { ExternalExecutorFormData } from '../../Executor';
import { UseSubmitProps } from './types';

export interface UseEditProps {
  create?: boolean;
  setValue: UseSubmitProps['setValue'];
  getValues: UseSubmitProps['getValues'];
}

export const useEdit = ({ create, setValue, getValues }: UseEditProps) => {
  const { permissionId } = useParams();
  const { rnp, principal } = useCurrentWallet();
  const { canister, fetching, data } = useWallet(principal);

  useEffect(() => {
    if (create || !permissionId) {
      return;
    }

    canister.get_permissions({ ids: [Number(permissionId)] });
  }, [setValue, permissionId]);

  useTrigger(
    ({ permissions }) => {
      if (!permissions.length) {
        return;
      }

      const parsed = parsePermission(permissions[0]);
      const targets = parsed.targets.map((t) => ({
        canisterId: t.canisterId || t.principal || '',
        methodName: t.method || '',
      }));

      setValue('name', parsed.name);
      setValue('scope', parsed.scope);
      setValue('targets', targets);
    },
    data.get_permissions,
    [data.get_permissions, setValue],
  );

  const onEdit = useCallback(async (): Promise<ExternalExecutorFormData> => {
    const permission = data.get_permissions?.permissions[0];

    if (!permissionId || !rnp || !permission) {
      return Promise.reject();
    }

    const old = parsePermission(permission);

    const values = getValues();
    const scope = { [values.scope]: null } as PermissionScope;

    const targets: PermissionTarget[] = values.targets.map((t) => {
      if (!t.canisterId) {
        return { SelfEmptyProgram: null };
      }
      if (t.canisterId && !t.methodName) {
        return { Canister: Principal.fromText(t.canisterId) };
      }
      return {
        Endpoint: { canister_id: Principal.fromText(t.canisterId), method_name: t.methodName },
      };
    });

    const payload: ExternalExecutorFormData = {
      title: 'Update permission',
      description: 'Update permission through interface',
      rnp,
      program: {
        RemoteCallSequence: [
          {
            endpoint: {
              canister_id: principal,
              method_name: 'update_permission',
            },
            cycles: BigInt(0),
            args: {
              CandidString: walletSerializer.update_permission({
                permission_id: Number(permissionId),
                new_name: old.name !== values.name ? [values.name] : [],
                new_scope: old.scope !== values.scope ? [scope] : [],
                new_targets: [targets], // TODO make check of change
              }),
            },
          },
        ],
      },
    };

    return payload;
  }, [getValues, permissionId, data.get_permissions]);

  let fallback: JSX.Element | null = null;

  if (create) {
    return { fallback, onEdit };
  }

  if (!permissionId) {
    fallback = <span>PermissionId is empty</span>;
  }

  if (fetching.get_permissions) {
    fallback = <span>fetching</span>;
  }

  if (!data.get_permissions?.permissions.length) {
    fallback = <span>Permission does not found</span>;
  }

  return {
    fallback,
    onEdit,
  };
};
