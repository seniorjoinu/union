import React from 'react';
import { Role } from 'wallet-ts';
import { parseRole } from '../utils';
import { Info } from './Info';
import { useAttachedPermissions } from './useAttachedPermissions';

export interface RoleInfoProps extends IClassName {
  editable?: boolean;
  role: Role;
  href: string;
}

export const RoleInfo = ({ role, editable, ...p }: RoleInfoProps) => {
  const { permissions, fetching } = useAttachedPermissions({ roleId: role.id });
  const { title } = parseRole(role.role_type);

  return (
    <Info
      title={title}
      editLink={editable ? `../role/edit/${role.id}` : undefined}
      fetching={fetching}
      items={permissions.map((p) => ({ id: p.id, children: p.name }))}
      {...p}
    />
  );
};
