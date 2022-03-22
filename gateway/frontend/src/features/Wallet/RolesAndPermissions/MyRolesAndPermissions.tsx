import React from 'react';
import styled from 'styled-components';
import { Text } from 'components';
import { useCurrentWallet } from '../context';
import { PermissionInfo as P } from './PermissionInfo';
import { RoleInfo as R } from './RoleInfo';

const Title = styled(Text)``;

const RoleInfo = styled(R)``;
const PermissionInfo = styled(P)``;

const Controls = styled.div`
  display: flex;
  flex-direction: row;

  & > *:not(:last-child) {
    margin-right: 16px;
  }
`;

const Items = styled.div`
  display: flex;
  flex-direction: column;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;

  ${Title} {
    margin-bottom: 16px;
  }

  ${Controls} {
    margin-bottom: 32px;
  }

  ${Items} {
    margin-bottom: 32px;
  }

  ${RoleInfo}, ${PermissionInfo} {
    margin-bottom: 32px;
  }
`;

export const MyRolesAndPermissions = () => {
  const { roles, permissions, fetching } = useCurrentWallet();

  return (
    <Container>
      <Title variant='h2'>Мои роли и пермиссии</Title>
      <Title variant='h4'>Роли</Title>
      <Items>
        {fetching.get_my_roles && <Text>fetching</Text>}
        {roles.map((role) => (
          <RoleInfo key={role.id} role={role} />
        ))}
      </Items>
      <Title variant='h4'>Пермиссии</Title>
      <Items>
        {fetching.get_my_permissions && <Text>fetching</Text>}
        {permissions.map((permission) => (
          <PermissionInfo key={permission.id} permission={permission} />
        ))}
      </Items>
    </Container>
  );
};
