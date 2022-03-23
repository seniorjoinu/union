import React from 'react';
import { useParams } from 'react-router-dom';
import { useTrigger } from 'toolkit';
import { useWallet } from '../../../services';
import { useCurrentWallet } from '../context';
import { parseRole } from '../utils';
import { RoleDetailsView } from './RoleDetailsView';

export const RoleDetails = () => {
  const { roleId } = useParams();
  const { rnp, principal } = useCurrentWallet();
  const { canister, fetching, data } = useWallet(principal);
  const forEnumeratedCanister = useWallet(principal);

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

  return <RoleDetailsView role={role} enumerated={enumerated} />;
};
