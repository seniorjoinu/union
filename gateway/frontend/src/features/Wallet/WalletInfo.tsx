import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Text } from 'components';
import { Role, Permission } from 'wallet-ts';
import { useWallet } from '../../services/controllers';
import { PermissionInfo } from './PermissionInfo';
import { RoleInfo } from './RoleInfo';

const Title = styled(Text)``;

const Container = styled.div`
  display: flex;
  flex-direction: column;

  ${Title} {
    margin-bottom: 16px;
  }
`;

export interface WalletInfoProps {
  principal: string;
}

export const WalletInfo = ({ principal }: WalletInfoProps) => {
  // const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const { canister, fetching } = useWallet(principal);

  useEffect(() => {
    // canister.get_roles().then(({ roles }) => setAllRoles(roles));
    canister.get_my_roles().then(({ roles }) => setRoles(roles));
    canister.get_my_permissions().then(({ permissions }) => setPermissions(permissions));
    // canister
  }, []);

  return (
    <Container>
      <Title variant='h3'>Роли</Title>
      {fetching.get_my_roles && <Text>fetching</Text>}
      {roles.map((role) => (
        <RoleInfo key={role.id} role={role} principal={principal} />
      ))}
      <Title variant='h3'>Пермиссии</Title>
      {fetching.get_my_permissions && <Text>fetching</Text>}
      {permissions.map((permission) => (
        <PermissionInfo key={permission.id} permission={permission} principal={principal} />
      ))}
    </Container>
  );
};
