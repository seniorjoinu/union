import { useState, useEffect } from 'react';
import { Role, Permission } from 'wallet-ts';
import { useWallet } from '../../../services/controllers';
import { useCurrentWallet } from '../context';

export interface UseAttachedPermissionsProps {
  role: Role;
}

export const useAttachedPermissions = ({ role }: UseAttachedPermissionsProps) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const { rnp, principal } = useCurrentWallet();
  const { data, canister, fetching } = useWallet(principal);

  useEffect(() => {
    if (!rnp) {
      return;
    }

    if (!!fetching.get_permissions_attached_to_roles || !!data.get_permissions_attached_to_roles) {
      return;
    }
    canister
      .get_permissions_attached_to_roles({
        rnp,
        role_ids: [role.id],
      })
      .then(({ result }) => {
        const ids = result.map(([, permissionIds]) => permissionIds).flat();

        canister
          .get_permissions({ rnp, ids })
          .then(({ permissions }) => setPermissions(permissions));
      });
  }, [
    rnp,
    data.get_permissions_attached_to_roles,
    fetching.get_permissions_attached_to_roles,
    setPermissions,
  ]);

  const progress = !!fetching.get_permissions_attached_to_roles || !!fetching.get_permissions;

  return {
    fetching: progress,
    permissions,
  };
};
