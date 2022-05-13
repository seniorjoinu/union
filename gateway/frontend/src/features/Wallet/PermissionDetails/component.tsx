import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Text } from '@union/components';
import { useUnion } from 'services';
import { useCurrentUnion } from '../context';
import { useRemove } from '../useRemove';
import { PermissionDetailsView } from './PermissionDetailsView';

const Title = styled(Text)`
  margin-bottom: 64px;
`;

export interface PermissionDetailsProps {
  edit(permissionId: BigInt): void;
}

export const PermissionDetails = ({ edit }: PermissionDetailsProps) => {
  const params = useParams();
  const permissionId = BigInt(params.permissionId || -1);
  const { removePermission } = useRemove();
  const { principal } = useCurrentUnion();
  const { canister, fetching, data } = useUnion(principal);

  useEffect(() => {
    canister.get_permission({ id: permissionId });
  }, [permissionId]);

  const permission = data.get_permission?.permission;

  if (!permissionId) {
    return <span>Unknown permission {Number(permissionId)}</span>;
  }

  if (fetching.list_permissions) {
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
        remove={() => removePermission([permissionId])}
        edit={() => edit(permissionId)}
      />
    </>
  );
};
