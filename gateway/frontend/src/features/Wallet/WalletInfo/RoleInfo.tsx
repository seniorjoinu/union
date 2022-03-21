import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Text, Chips } from 'components';
import { Role, Permission } from 'wallet-ts';
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

export interface RoleInfoProps extends IClassName {
  role: Role;
  principal: string;
}

export const RoleInfo = ({ principal, role, ...p }: RoleInfoProps) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const { data, canister, fetching } = useWallet(principal);
  const { rnp } = useCurrentWallet();

  useEffect(() => {
    if (!rnp) {
      return;
    }

    if (!!fetching.get_permissions_attached_to_roles || !!data.get_permissions_attached_to_roles) {
      return;
    }
    canister
      .get_permissions_attached_to_roles({
        rnp,
        role_ids: [role.id],
      })
      .then(({ result }) => {
        const ids = result.map(([, permissionIds]) => permissionIds).flat();

        canister
          .get_permissions({ rnp, ids })
          .then(({ permissions }) => setPermissions(permissions));
      });
  }, [
    rnp,
    data.get_permissions_attached_to_roles,
    fetching.get_permissions_attached_to_roles,
    setPermissions,
  ]);

  const progress = !!fetching.get_permissions_attached_to_roles || !!fetching.get_permissions;

  return (
    <Container {...p}>
      <Title variant='h5'>{parseRole(role.role_type).title}</Title>
      {progress && <span>fetching</span>}
      <Items>
        {permissions.map((p) => (
          <Chips key={p.id}>{p.name}</Chips>
        ))}
      </Items>
    </Container>
  );
};
