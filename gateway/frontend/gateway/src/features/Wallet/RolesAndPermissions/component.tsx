import React, { useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { Text, Button as B, Accordeon as A } from 'components';
import { NavLink } from 'react-router-dom';
import { useWallet } from 'services';
import { Role } from 'wallet-ts';
import { useCurrentWallet } from '../context';
import { PermissionInfo as P } from './PermissionInfo';
import { RoleInfo as R } from './RoleInfo';

const Title = styled(Text)``;

const RoleInfo = styled(R)``;
const PermissionInfo = styled(P)``;
const Button = styled(B)``;
const Accordeon = styled(A)``;

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
  padding: 16px 0;

  ${RoleInfo}:not(:last-child), ${PermissionInfo}:not(:last-child) {
    margin-bottom: 32px;
  }
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

  ${Accordeon} {
    margin-bottom: 16px;
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

  useEffect(() => {
    canister.get_role_ids().then(({ ids }) => (ids.length ? canister.get_roles({ ids }) : null));
    canister
      .get_permission_ids()
      .then(({ ids }) => (ids.length ? canister.get_permissions({ ids }) : null));
  }, []);

  const roles = data.get_roles?.roles || [];
  const groups = useMemo(
    () =>
      roles.reduce(
        (acc, next) => {
          if ('Profile' in next.role_type) {
            acc.Profile.push(next); // FIXME refactoring
          } else {
            acc.Another.push(next);
          }
          return acc;
        },
        { Profile: [], Another: [] } as { Profile: Role[]; Another: Role[] },
      ),
    [roles],
  );

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
      <Accordeon title='Профили' border='no-border'>
        <Items>
          {(fetching.get_role_ids || fetching.get_roles) && <Text>fetching</Text>}
          {!(fetching.get_role_ids || fetching.get_roles) && !groups.Profile.length && (
            <Text>Профили отсутствуют</Text>
          )}
          {groups.Profile.map((role, i) => (
            <RoleInfo
              key={`${role.id}${i}`}
              role={role}
              edit={() => editRole(role.id)}
              open={() => openRole(role.id)}
              editable
            />
          ))}
        </Items>
      </Accordeon>
      <Accordeon title='Роли' isDefaultOpened border='no-border'>
        <Items>
          {(fetching.get_role_ids || fetching.get_roles) && <Text>fetching</Text>}
          {!(fetching.get_role_ids || fetching.get_roles) && !groups.Another.length && (
            <Text>Роли отсутствуют</Text>
          )}
          {groups.Another.map((role, i) => (
            <RoleInfo
              key={`${role.id}${i}`}
              role={role}
              edit={() => editRole(role.id)}
              open={() => openRole(role.id)}
              editable
            />
          ))}
        </Items>
      </Accordeon>
      <Accordeon title='Пермиссии' isDefaultOpened border='no-border'>
        <Items>
          {(fetching.get_permission_ids || fetching.get_permissions) && <Text>fetching</Text>}
          {!(fetching.get_permission_ids || fetching.get_permissions) && !permissions.length && (
            <Text>Пермиссии отсутствуют</Text>
          )}
          {permissions.map((permission, i) => (
            <PermissionInfo
              key={`${permission.id}${i}`}
              permission={permission}
              edit={() => editPermission(permission.id)}
              open={() => openPermission(permission.id)}
              editable
            />
          ))}
        </Items>
      </Accordeon>
    </Container>
  );
};
