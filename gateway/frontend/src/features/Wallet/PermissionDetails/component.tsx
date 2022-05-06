import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Text } from 'components';
import { useUnion } from 'services';
import { useCurrentUnion } from '../context';
import { useAttachedRoles } from '../useAttachedRoles';
import { useRemove } from '../useRemove';
import { useDetach } from '../useDetach';
import { PermissionDetailsView } from './PermissionDetailsView';
import { RolesAttacher } from './RolesAttacher';

const Title = styled(Text)`
  margin-bottom: 64px;
`;

export interface PermissionDetailsProps {
  edit(permissionId: number): void;
}

export const PermissionDetails = ({ edit }: PermissionDetailsProps) => {
  const { permissionId } = useParams();
  const { removePermission } = useRemove();
  const { detachRoleAndPermission } = useDetach();
  const { principal } = useCurrentUnion();
  const { canister, fetching, data } = useUnion(principal);
  const { roles } = useAttachedRoles({ permissionId });

  useEffect(() => {
    canister.get_permissions({ ids: [Number(permissionId)] });
  }, [permissionId]);

  const permission = data.get_permissions?.permissions[0];

  if (!permissionId) {
    return <span>Unknown permission {permissionId}</span>;
  }

  if (fetching.get_permissions) {
    return <span>fetching</span>;
  }

  if (!permission) {
    return <span>Permission not found</span>;
  }

  return (
    <>
      <Title variant='h2'>{permission.name}</Title>
      <PermissionDetailsView
        permission={permission}
        roles={roles}
        detachRole={detachRoleAndPermission}
        remove={() => removePermission([permission.id])}
        edit={() => edit(permission.id)}
      />
      <RolesAttacher permission={permission} />
    </>
  );
};
