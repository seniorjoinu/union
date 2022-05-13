import React, { useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTrigger } from 'toolkit';
import { useUnion, walletSerializer } from 'services';
import { PermissionTarget } from 'union-ts';
import { Principal } from '@dfinity/principal';
import { parsePermission } from '../utils';
import { useCurrentUnion } from '../context';
import { UseSubmitProps } from './types';

export interface UseEditProps {
  create?: boolean;
  setValue: UseSubmitProps['setValue'];
  getValues: UseSubmitProps['getValues'];
}

export const useEdit = ({ create, setValue, getValues }: UseEditProps) => {
  const params = useParams();
  const permissionId = BigInt(params.permissionId || -1);
  const { principal } = useCurrentUnion();
  const { canister, fetching, data } = useUnion(principal);

  useEffect(() => {
    if (create || !permissionId) {
      return;
    }

    canister.get_permission({ id: permissionId });
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

  const onEdit = useCallback(async () => {
    const permission = data.get_permission?.permission;

    if (!permissionId || !permission) {
      return Promise.reject();
    }

    const old = parsePermission(permission);

    const values = getValues();

    const targets: PermissionTarget[] = values.targets.map((t) => {
      if (!t.canisterId) {
        return { SelfEmptyProgram: null };
      }
      return {
        Endpoint: { canister_id: Principal.fromText(t.canisterId), method_name: t.methodName },
      };
    });

    // const payload: ExternalExecutorFormData = {
    //   program: {
    //     RemoteCallSequence: [
    //       {
    //         endpoint: {
    //           canister_id: principal,
    //           method_name: 'update_permission',
    //         },
    //         cycles: BigInt(0),
    //         args: {
    //           CandidString: walletSerializer.update_permission({
    //             id: permissionId,
    //             new_name: old.name !== values.name ? [values.name] : [],
    //             new_description: old.description !== values.description ? [values.description] : [],
    //             new_targets: [targets], // TODO make check of change
    //           }),
    //         },
    //       },
    //     ],
    //   },
    // };
    // return payload;
  }, [getValues, permissionId, data.get_permission]);

  let fallback: JSX.Element | null = null;

  if (create) {
    return { fallback, onEdit };
  }

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
    onEdit,
  };
};
