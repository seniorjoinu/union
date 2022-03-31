import React from 'react';
import { useParams } from 'react-router-dom';
import { Text } from 'components';
import { useTrigger } from 'toolkit';
import styled from 'styled-components';
import { useWallet } from 'services';
import { useCurrentWallet } from '../context';
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
  const { rnp, principal } = useCurrentWallet();
  const { canister, fetching, data } = useWallet(principal);
  const forEnumeratedCanister = useWallet(principal);
  const { permissions } = useAttachedPermissions({ roleId });

  useTrigger(
    (rnp) => {
      canister.get_roles({ rnp, ids: [Number(roleId)] });
    },
    rnp,
    [roleId],
  );

  const role = data.get_roles?.roles[0];
  const parsedRole = role ? parseRole(role.role_type) : null;

  useTrigger(
    (parsedRole) => {
      if (!rnp) {
        return;
      }

      if (!parsedRole.enumerated.length) {
        return;
      }

      forEnumeratedCanister.canister.get_roles({ rnp, ids: parsedRole.enumerated });
    },
    parsedRole,
    [rnp, forEnumeratedCanister],
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
