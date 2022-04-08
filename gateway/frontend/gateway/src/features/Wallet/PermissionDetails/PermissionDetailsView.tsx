import React from 'react';
import styled from 'styled-components';
import { Text, TextProps, Button as B } from 'components';
import { Permission, Role } from 'wallet-ts';
import { parsePermission } from '../utils';
import { RoleDetailsView } from '../RoleDetails';

const DetachButton = styled(B)``;
const RemoveButton = styled(B)`
  color: red;
`;
const Title = styled(Text)``;
const Description = styled(Text)``;
const Item = styled.div`
  display: flex;
  flex-direction: column;

  & > *:not(:last-child) {
    margin-bottom: 8px;
  }
`;
const Controls = styled.div`
  display: flex;
  flex-direction: row;

  & > * {
    margin-right: 8px;
  }
`;
const Items = styled.div`
  display: flex;
  flex-direction: column;

  & > * {
    padding: 8px;
    border: 1px solid grey;
    border-radius: 4px;
  }

  & > *:not(:last-child) {
    margin-bottom: 16px;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;

  ${Title}, ${Items} {
    margin-bottom: 24px;
  }
  & > ${Description} {
    margin-bottom: 16px;
  }
  ${Controls} {
    margin-bottom: 16px;
  }
`;

export interface PermissionDetailsViewProps extends IClassName {
  permission: Permission;
  roles: Role[];
  variant?: TextProps['variant'];
  detach?(): void;
  detachRole?(r: Role, p: Permission): void;
  remove?(): void;
  edit?(): void;
}

export const PermissionDetailsView = ({
  variant = 'p1',
  permission,
  roles,
  detachRole,
  detach,
  remove,
  edit,
  ...p
}: PermissionDetailsViewProps) => {
  const parsedPermission = parsePermission(permission);

  return (
    <Container {...p}>
      <Controls>
        {detach && (
          <DetachButton size='S' onClick={detach}>
            Detach
          </DetachButton>
        )}
        {edit && (
          <DetachButton size='S' onClick={edit}>
            Edit
          </DetachButton>
        )}
        {remove && (
          <RemoveButton size='S' onClick={remove}>
            Remove
          </RemoveButton>
        )}
      </Controls>
      <Title variant={variant}>Name: {parsedPermission.name}</Title>
      <Description variant={variant}>Type: {parsedPermission.scope}</Description>
      {!!parsedPermission.targets.length && (
        <>
          <Title variant='h4'>Targets</Title>
          <Items>
            {parsedPermission.targets.map((target, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <Item key={String(i)}>
                <Text variant='p3'>Type: {target.type}</Text>
                {!!(target.principal || target.canisterId) && (
                  <Description variant='p3'>
                    {target.principal || target.canisterId}:{target.method || '*'}
                    {target.method ? '()' : ''}
                  </Description>
                )}
              </Item>
            ))}
          </Items>
        </>
      )}
      {!!roles.length && (
        <>
          <Title variant='h4'>Roles</Title>
          <Items>
            {roles.map((role) => (
              <RoleDetailsView
                key={role.id}
                variant='p3'
                role={role}
                permissions={[]}
                enumerated={[]}
                detach={() => detachRole && detachRole(role, permission)}
              />
            ))}
          </Items>
        </>
      )}
    </Container>
  );
};
