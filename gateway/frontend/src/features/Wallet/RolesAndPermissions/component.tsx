import React, { useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { PageWrapper, Text, Button as B, Accordeon as A } from '@union/components';
import { NavLink } from 'react-router-dom';
import { useUnion } from 'services';
import { Role } from 'union-ts';
import { useCurrentUnion } from '../context';
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
  justify-content: flex-end;

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

const Container = styled(PageWrapper)`
  ${Title} {
    margin-bottom: 16px;
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
  const { rnp, principal } = useCurrentUnion();
  const { canister, fetching, data } = useUnion(principal);

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
    <Container title='Roles and permissions'>
      {!!rnp && (
        <Controls>
          <Button forwardedAs={NavLink} to='my'>
            My roles
          </Button>
          <Button forwardedAs={NavLink} to='../role/create'>
            + Create new role
          </Button>
          <Button forwardedAs={NavLink} to='../permission/create'>
            + Create new permission
          </Button>
        </Controls>
      )}
      <Accordeon title='Profiles' border='no-border'>
        <Items>
          {(fetching.get_role_ids || fetching.get_roles) && <Text>fetching</Text>}
          {!(fetching.get_role_ids || fetching.get_roles) && !groups.Profile.length && (
            <Text>Profiles does not exist</Text>
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
      <Accordeon title='Roles' isDefaultOpened border='no-border'>
        <Items>
          {(fetching.get_role_ids || fetching.get_roles) && <Text>fetching</Text>}
          {!(fetching.get_role_ids || fetching.get_roles) && !groups.Another.length && (
            <Text>Roles does not exist</Text>
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
      <Accordeon title='Permissions' isDefaultOpened border='no-border'>
        <Items>
          {(fetching.get_permission_ids || fetching.get_permissions) && <Text>fetching</Text>}
          {!(fetching.get_permission_ids || fetching.get_permissions) && !permissions.length && (
            <Text>Permissions does not exist</Text>
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
