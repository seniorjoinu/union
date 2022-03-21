import React from 'react';
import styled from 'styled-components';
import { Text } from 'components';
import { PermissionInfo } from './PermissionInfo';
import { RoleInfo } from './RoleInfo';
import { useCurrentWallet } from './context';

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
  const { roles, permissions, fetching } = useCurrentWallet();

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
