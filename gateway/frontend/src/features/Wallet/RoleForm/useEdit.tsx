import React from 'react';
import { useParams } from 'react-router-dom';
import { useTrigger } from 'toolkit';
import { useWallet } from '../../../services';
import { parseRole } from '../utils';
import { useCurrentWallet } from '../context';

export interface UseEditProps {
  create?: boolean;
  setValue(name: string, value: any): void;
}

export const useEdit = ({ create, setValue }: UseEditProps) => {
  const { roleId } = useParams();
  const { rnp, principal } = useCurrentWallet();
  const { canister, fetching, data } = useWallet(principal);

  useTrigger(
    async (rnp) => {
      if (create || !roleId) {
        return;
      }

      canister.get_roles({ rnp, ids: [Number(roleId)] });
    },
    rnp,
    [setValue, roleId],
  );

  useTrigger(
    ({ roles }) => {
      if (!roles.length) {
        return;
      }

      const roleType = parseRole(roles[0].role_type);

      setValue('name', roleType.title);
      setValue('threshold', roleType.threshold);
      if (roleType.type) {
        setValue('type', roleType.type);
      }
    },
    data.get_roles,
    [data.get_roles, setValue],
  );

  let fallback: JSX.Element | null = null;

  if (create) {
    return { fallback };
  }

  if (!roleId) {
    fallback = <span>RoleId is empty</span>;
  }

  if (fetching.get_roles) {
    fallback = <span>fetching</span>;
  }

  if (!data.get_roles?.roles.length) {
    fallback = <span>Role does not found</span>;
  }

  const roleType = data.get_roles?.roles[0]?.role_type || {};
  const validRole = 'QuantityOf' in roleType || 'FractionOf' in roleType;

  if (!validRole) {
    fallback = <span>Role does not support</span>;
  }

  return {
    fallback,
  };
};
