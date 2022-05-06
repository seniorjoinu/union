import { useState, useEffect, useCallback } from 'react';
import { Role } from 'union-ts';
import { useUnion } from '../../services/controllers';
import { useCurrentUnion } from './context';

export interface UseAttachedRolesProps {
  permissionId: number | string | null | undefined;
}

export const useAttachedRoles = ({ permissionId }: UseAttachedRolesProps) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const { principal } = useCurrentUnion();
  const { data, canister, fetching, errors } = useUnion(principal);

  const fetchRoles = useCallback(() => {
    if (permissionId == undefined || permissionId == null) {
      return;
    }

    canister
      .get_roles_attached_to_permissions({
        permission_ids: [Number(permissionId)],
      })
      .then(({ result }) => {
        const ids = result.map(([, roleIds]) => roleIds).flat();

        if (!ids.length) {
          return;
        }

        canister.get_roles({ ids }).then(({ roles }) => setRoles(roles));
      });
  }, [permissionId]);

  useEffect(() => {
    if (permissionId == undefined || permissionId == null) {
      return;
    }

    if (
      !!fetching.get_roles_attached_to_permissions ||
      !!data.get_roles_attached_to_permissions ||
      !!errors.get_roles_attached_to_permissions
    ) {
      return;
    }

    fetchRoles();
  }, [
    data.get_roles_attached_to_permissions,
    fetching.get_roles_attached_to_permissions,
    errors.get_roles_attached_to_permissions,
    setRoles,
    fetchRoles,
  ]);

  const progress = !!fetching.get_roles_attached_to_permissions || !!fetching.get_roles;

  return {
    fetching: progress,
    fetchRoles,
    roles,
  };
};
