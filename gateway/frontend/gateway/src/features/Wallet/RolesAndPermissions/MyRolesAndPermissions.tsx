import React, { useEffect } from 'react';
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

    &:first-of-type {
      margin-bottom: 64px;
    }
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

export interface MyRolesAndPermissionsProps {
  editRole(roleId: number): void;
  editPermission(permissionId: number): void;
  openRole(roleId: number): void;
  openPermission(permissionId: number): void;
}

export const MyRolesAndPermissions = ({
  editRole,
  editPermission,
  openPermission,
  openRole,
}: MyRolesAndPermissionsProps) => {
  const { fetchMyData, roles, permissions, fetching } = useCurrentWallet();

  useEffect(() => {
    fetchMyData();
  }, []);

  return (
    <Container>
      <Title variant='h2'>Мои роли и пермиссии</Title>
      <Title variant='h4'>Роли</Title>
      <Items>
        {fetching.get_my_roles && <Text>fetching</Text>}
        {!fetching.get_my_roles && !roles.length && <Text>Роли отсутствуют</Text>}
        {roles.map((role) => (
          <RoleInfo
            key={role.id}
            role={role}
            edit={() => editRole(role.id)}
            open={() => openRole(role.id)}
          />
        ))}
      </Items>
      <Title variant='h4'>Пермиссии</Title>
      <Items>
        {fetching.get_my_permissions && <Text>fetching</Text>}
        {!fetching.get_my_permissions && !permissions.length && <Text>Пермиссии отсутствуют</Text>}
        {permissions.map((permission) => (
          <PermissionInfo
            key={permission.id}
            permission={permission}
            edit={() => editPermission(permission.id)}
            open={() => openPermission(permission.id)}
          />
        ))}
      </Items>
    </Container>
  );
};
