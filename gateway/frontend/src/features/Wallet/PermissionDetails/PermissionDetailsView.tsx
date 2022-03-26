import React from 'react';
import styled from 'styled-components';
import { Text, TextProps } from 'components';
import { Permission, Role } from 'wallet-ts';
import { parsePermission } from '../utils';
import { RoleDetailsView } from '../RoleDetails';

const Title = styled(Text)``;
const Description = styled(Text)``;
const Item = styled.div`
  display: flex;
  flex-direction: column;

  & > *:not(:last-child) {
    margin-bottom: 8px;
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
`;

export interface PermissionDetailsViewProps extends IClassName {
  permission: Permission;
  roles: Role[];
  variant?: TextProps['variant'];
}

export const PermissionDetailsView = ({
  variant = 'p1',
  permission,
  roles,
  ...p
}: PermissionDetailsViewProps) => {
  const parsedPermission = parsePermission(permission);

  return (
    <Container {...p}>
      <Title variant={variant}>Имя: {parsedPermission.name}</Title>
      <Description variant={variant}>Тип: {parsedPermission.scope}</Description>
      {!!parsedPermission.targets.length && (
        <>
          <Title variant='h4'>Цели</Title>
          <Items>
            {parsedPermission.targets.map((target, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <Item key={String(i)}>
                <Text variant='p3'>Тип: {target.type}</Text>
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
          <Title variant='h4'>Роли</Title>
          <Items>
            {roles.map((role) => (
              <RoleDetailsView
                key={role.id}
                variant='p3'
                role={role}
                permissions={[]}
                enumerated={[]}
              />
            ))}
          </Items>
        </>
      )}
    </Container>
  );
};
