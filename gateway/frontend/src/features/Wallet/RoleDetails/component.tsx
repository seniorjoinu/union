import React from 'react';
import { useParams } from 'react-router-dom';
import { Text } from 'components';
import { useTrigger } from 'toolkit';
import styled from 'styled-components';
import { useWallet } from 'services';
import { useCurrentWallet } from '../context';
import { parseRole } from '../utils';
import { useAttachedPermissions } from '../useAttachedPermissions';
import { RoleDetailsView } from './RoleDetailsView';
import { Attacher } from './Attacher';

const Title = styled(Text)`
  margin-bottom: 64px;
`;

export const RoleDetails = () => {
  const { roleId } = useParams();
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
      <RoleDetailsView role={role} permissions={permissions} enumerated={enumerated} />
      <Attacher role={role} />
    </>
  );
};
