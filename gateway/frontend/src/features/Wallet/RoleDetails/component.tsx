import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Text } from 'components';
import { useTrigger } from 'toolkit';
import styled from 'styled-components';
import { useUnion } from 'services';
import { useCurrentUnion } from '../context';
import { parseRole } from '../utils';
import { useAttachedPermissions } from '../useAttachedPermissions';
import { useDetach } from '../useDetach';
import { useRemove } from '../useRemove';
import { useEnumeratedRoles } from '../useEnumeratedRoles';
import { RoleDetailsView } from './RoleDetailsView';
import { PermissionsAttacher as PA } from './PermissionsAttacher';
import { RolesAttacher as RA } from './RolesAttacher';

const PermissionsAttacher = styled(PA)``;
const RolesAttacher = styled(RA)`
  margin-top: 24px;
`;

const Title = styled(Text)`
  margin-bottom: 64px;
`;

export interface RoleDetailsProps {
  edit(roleId: number): void;
}

export const RoleDetails = ({ edit }: RoleDetailsProps) => {
  const { roleId } = useParams();
  const { removeRole } = useRemove();
  const { substractEnumeratedRoles } = useEnumeratedRoles();
  const { detachRoleAndPermission } = useDetach();
  const { principal } = useCurrentUnion();
  const { canister, fetching, data } = useUnion(principal);
  const forEnumeratedCanister = useUnion(principal);
  const { permissions } = useAttachedPermissions({ roleId });

  useEffect(() => {
    canister.get_roles({ ids: [Number(roleId)] });
  }, [roleId]);

  const role = data.get_roles?.roles[0];
  const parsedRole = role ? parseRole(role.role_type) : null;

  useTrigger(
    (parsedRole) => {
      if (!parsedRole.enumerated.length) {
        return;
      }

      forEnumeratedCanister.canister.get_roles({ ids: parsedRole.enumerated });
    },
    parsedRole,
    [forEnumeratedCanister],
  );

  const enumerated = forEnumeratedCanister.data.get_roles?.roles || [];

  if (!roleId) {
    return <span>Unknown role {roleId}</span>;
  }

  if (fetching.get_roles) {
    return <span>fetching</span>;
  }

  if (!role || !parsedRole) {
    return <span>Role not found</span>;
  }

  return (
    <>
      <Title variant='h2'>{parsedRole.title}</Title>
      <RoleDetailsView
        role={role}
        permissions={permissions}
        enumerated={enumerated}
        remove={() => removeRole([role.id])}
        edit={() => edit(role.id)}
        detachPermission={detachRoleAndPermission}
        substractRole={(from, role) => substractEnumeratedRoles(from, [role.id])}
      />
      <PermissionsAttacher role={role} />
      {['FractionOf', 'QuantityOf'].includes(parsedRole.type) && (
        <RolesAttacher role={role} enumerated={enumerated} />
      )}
    </>
  );
};
