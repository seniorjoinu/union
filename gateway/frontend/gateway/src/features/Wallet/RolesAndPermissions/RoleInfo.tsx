import React from 'react';
import { Role } from 'wallet-ts';
import { parseRole } from '../utils';
import { useAttachedPermissions } from '../useAttachedPermissions';
import { Info } from './Info';

export interface RoleInfoProps extends IClassName {
  editable?: boolean;
  role: Role;
  edit(): void;
  open(): void;
}

export const RoleInfo = ({ role, editable, edit, open, ...p }: RoleInfoProps) => {
  const { permissions, fetching } = useAttachedPermissions({ roleId: role.id });
  const { title } = parseRole(role.role_type);

  return (
    <Info
      title={title}
      edit={editable && !('Everyone' in role.role_type) ? edit : undefined}
      open={open}
      fetching={fetching}
      items={permissions.map((p) => ({ id: p.id, children: p.name }))}
      {...p}
    />
  );
};
