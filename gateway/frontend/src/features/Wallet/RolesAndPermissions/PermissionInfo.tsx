import React, { useEffect, useState } from 'react';
import { Permission, Role } from 'wallet-ts';
import { useWallet } from '../../../services/controllers';
import { useCurrentWallet } from '../context';
import { parseRole } from '../utils';
import { Info } from './Info';

export interface PermissionInfoProps extends IClassName {
  editable?: boolean;
  permission: Permission;
}

export const PermissionInfo = ({ permission, editable, ...p }: PermissionInfoProps) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const { rnp, principal } = useCurrentWallet();
  const { data, canister, fetching } = useWallet(principal);

  useEffect(() => {
    if (!rnp) {
      return;
    }

    if (!!fetching.get_roles_attached_to_permissions || !!data.get_roles_attached_to_permissions) {
      return;
    }
    canister
      .get_roles_attached_to_permissions({
        rnp,
        permission_ids: [permission.id],
      })
      .then(({ result }) => {
        const ids = result.map(([, roleIds]) => roleIds).flat();

        canister.get_roles({ rnp, ids }).then(({ roles }) => setRoles(roles));
      });
  }, [
    rnp,
    data.get_roles_attached_to_permissions,
    fetching.get_roles_attached_to_permissions,
    setRoles,
  ]);

  const progress = !!fetching.get_roles_attached_to_permissions || !!fetching.get_roles;

  return (
    <Info
      title={permission.name}
      editLink={editable ? `permission/edit/${permission.id}` : undefined}
      fetching={progress}
      items={roles.map((r) => ({ id: r.id, children: parseRole(r.role_type).title }))}
      {...p}
    />
  );
};
