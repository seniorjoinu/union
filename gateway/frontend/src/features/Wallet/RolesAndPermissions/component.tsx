import React from 'react';
import styled from 'styled-components';
import { Text, Button as B } from 'components';
import { NavLink } from 'react-router-dom';
import { useTrigger } from 'toolkit';
import { useWallet } from 'services';
import { useCurrentWallet } from '../context';
import { PermissionInfo as P } from './PermissionInfo';
import { RoleInfo as R } from './RoleInfo';

const Title = styled(Text)``;

const RoleInfo = styled(R)``;
const PermissionInfo = styled(P)``;
const Button = styled(B)``;

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

export interface RolesAndPermissionsProps {
  editRole(roleId: number): void;
  editPermission(permissionId: number): void;
  openRole(roleId: number): void;
  openPermission(permissionId: number): void;
}

export const RolesAndPermissions = ({
  editRole,
  editPermission,
  openPermission,
  openRole,
}: RolesAndPermissionsProps) => {
  const { rnp, principal } = useCurrentWallet();
  const { canister, fetching, data } = useWallet(principal);

  useTrigger(
    (rnp) => {
      canister
        .get_role_ids({ rnp })
        .then(({ ids }) => (ids.length ? canister.get_roles({ rnp, ids }) : null));
      canister
        .get_permission_ids({ rnp })
        .then(({ ids }) => (ids.length ? canister.get_permissions({ rnp, ids }) : null));
    },
    rnp,
    [],
  );

  const roles = data.get_roles?.roles || [];
  const permissions = data.get_permissions?.permissions || [];

  return (
    <Container>
      <Title variant='h2'>Роли и пермиссии</Title>
      {!!rnp && (
        <Controls>
          <Button forwardedAs={NavLink} to='my'>
            Мои роли
          </Button>
          <Button forwardedAs={NavLink} to='../role/create'>
            + Создать новую роль
          </Button>
          <Button forwardedAs={NavLink} to='../permission/create'>
            + Создать новую пермиссию
          </Button>
        </Controls>
      )}
      <Title variant='h4'>Роли</Title>
      <Items>
        {(fetching.get_role_ids || fetching.get_roles) && <Text>fetching</Text>}
        {!(fetching.get_role_ids || fetching.get_roles) && !roles.length && (
          <Text>Роли отсутствуют</Text>
        )}
        {roles.map((role) => (
          <RoleInfo
            key={role.id}
            role={role}
            edit={() => editRole(role.id)}
            open={() => openRole(role.id)}
            editable
          />
        ))}
      </Items>
      <Title variant='h4'>Пермиссии</Title>
      <Items>
        {(fetching.get_permission_ids || fetching.get_permissions) && <Text>fetching</Text>}
        {!(fetching.get_permission_ids || fetching.get_permissions) && !permissions.length && (
          <Text>Пермиссии отсутствуют</Text>
        )}
        {permissions.map((permission) => (
          <PermissionInfo
            key={permission.id}
            permission={permission}
            edit={() => editPermission(permission.id)}
            open={() => openPermission(permission.id)}
            editable
          />
        ))}
      </Items>
    </Container>
  );
};
