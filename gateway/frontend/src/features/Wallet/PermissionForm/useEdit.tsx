import React, { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useTrigger } from 'toolkit';
import { useWallet } from '../../../services';
import { parsePermission } from '../utils';
import { useCurrentWallet } from '../context';
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

  useTrigger(
    async (rnp) => {
      if (create || !permissionId) {
        return;
      }

      canister.get_permissions({ rnp, ids: [Number(permissionId)] });
    },
    rnp,
    [setValue, permissionId],
  );

  useTrigger(
    ({ permissions }) => {
      if (!permissions.length) {
        return;
      }

      const parsed = parsePermission(permissions[0]);

      setValue('name', parsed.name);
      setValue('scope', parsed.scope);
      setValue(
        'targets',
        parsed.targets.map((t) => ({ canisterId: t.canisterId || '', methodName: t.method || '' })),
      );
    },
    data.get_permissions,
    [data.get_permissions, setValue],
  );

  const onEdit = useCallback(async () => {
    console.error('Not implemented');
  }, [getValues]);

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
