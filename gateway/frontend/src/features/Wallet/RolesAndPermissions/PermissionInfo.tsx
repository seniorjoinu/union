import React from 'react';
import { Permission } from 'wallet-ts';
import { parseRole } from '../utils';
import { useAttachedRoles } from '../useAttachedRoles';
import { Info } from './Info';

export interface PermissionInfoProps extends IClassName {
  editable?: boolean;
  permission: Permission;
  edit(): void;
  open(): void;
}

export const PermissionInfo = ({ permission, editable, edit, open, ...p }: PermissionInfoProps) => {
  const { roles, fetching } = useAttachedRoles({ permissionId: permission.id });

  return (
    <Info
      title={permission.name}
      edit={editable ? edit : undefined}
      open={open}
      fetching={fetching}
      items={roles.map((r) => ({ id: r.id, children: parseRole(r.role_type).title }))}
      {...p}
    />
  );
};
