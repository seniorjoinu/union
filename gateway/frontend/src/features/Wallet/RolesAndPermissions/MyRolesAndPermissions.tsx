import React, { useEffect } from 'react';
import styled from 'styled-components';
import { PageWrapper, Text } from 'components';
import { useCurrentUnion } from '../context';
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

const Container = styled(PageWrapper)`
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
  const { fetchMyData, roles, permissions, fetching } = useCurrentUnion();

  useEffect(() => {
    fetchMyData();
  }, []);

  return (
    <Container title='My roles and permissions'>
      <Title variant='h4'>Roles</Title>
      <Items>
        {fetching.get_my_roles && <Text>fetching</Text>}
        {!fetching.get_my_roles && !roles.length && <Text>Roles does not exist</Text>}
        {roles.map((role, i) => (
          <RoleInfo
            key={`${role.id}${i}`}
            role={role}
            edit={() => editRole(role.id)}
            open={() => openRole(role.id)}
          />
        ))}
      </Items>
      <Title variant='h4'>Permissions</Title>
      <Items>
        {fetching.get_my_permissions && <Text>fetching</Text>}
        {!fetching.get_my_permissions && !permissions.length && (
          <Text>Permissions does not exists</Text>
        )}
        {permissions.map((permission, i) => (
          <PermissionInfo
            key={`${permission.id}${i}`}
            permission={permission}
            edit={() => editPermission(permission.id)}
            open={() => openPermission(permission.id)}
          />
        ))}
      </Items>
    </Container>
  );
};