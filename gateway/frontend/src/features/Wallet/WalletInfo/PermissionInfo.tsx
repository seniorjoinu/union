import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Text, Chips } from 'components';
import { Permission, Role } from 'wallet-ts';
import { useWallet } from '../../../services/controllers';
import { useCurrentWallet } from '../context';
import { parseRole } from './utils';

const Title = styled(Text)``;

const Items = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;

  & > *:not(:last-child) {
    margin-right: 16px;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;

  ${Title} {
    margin-bottom: 8px;
  }
`;

export interface PermissionInfoProps extends IClassName {
  permission: Permission;
  principal: string;
}

export const PermissionInfo = ({ principal, permission, ...p }: PermissionInfoProps) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const { data, canister, fetching } = useWallet(principal);
  const { rnp } = useCurrentWallet();

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
    <Container {...p}>
      <Title variant='h5'>{permission.name}</Title>
      {progress && <span>fetching</span>}
      <Items>
        {roles.map((r) => (
          <Chips key={r.id}>{parseRole(r.role_type).title}</Chips>
        ))}
      </Items>
    </Container>
  );
};
