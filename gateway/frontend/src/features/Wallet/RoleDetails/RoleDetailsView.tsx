import React from 'react';
import styled from 'styled-components';
import { Role, Permission } from 'wallet-ts';
import { Text, TextProps } from 'components';
import { parseRole } from '../utils';
import { PermissionDetailsView as PDV } from '../PermissionDetails';

const PermissionDetailsView = styled(PDV)`
  padding: 8px;
  border: 1px solid grey;
  border-radius: 4px;
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

export interface RoleDetailsViewProps extends IClassName {
  role: Role;
  permissions: Permission[];
  enumerated: Role[];
  variant?: TextProps['variant'];
}

export const RoleDetailsView = ({
  variant = 'p1',
  role,
  permissions,
  enumerated,
  ...p
}: RoleDetailsViewProps) => {
  const parsedRole = parseRole(role.role_type);

  return (
    <Container {...p}>
      <Description variant={variant}>Имя: {parsedRole.title}</Description>
      <Description variant={variant}>Описание: {parsedRole.description}</Description>
      <Description variant={variant}>Тип: {parsedRole.type}</Description>
      {!!parsedRole.principal && (
        <Description variant={variant}>Принципал: {parsedRole.principal}</Description>
      )}
      {!!parsedRole.threshold && (
        <Description variant={variant}>Пороговое значение: {parsedRole.threshold}</Description>
      )}
      {!!enumerated.length && (
        <>
          <Title variant='h4'>Связанные роли</Title>
          <Items>
            {enumerated.map((role) => {
              const parsed = parseRole(role.role_type);

              return (
                <Item key={String(role.id)}>
                  <Text variant='p3'>Имя: {parsed.title}</Text>
                  <Description variant='p3'>Описание: {parsed.description}</Description>
                  <Description variant='p3'>Тип: {parsed.type}</Description>
                  {!!parsed.principal && (
                    <Description variant='p3'>Принципал: {parsed.principal}</Description>
                  )}
                  {!!parsed.threshold && (
                    <Description variant='p3'>Пороговое значение: {parsed.threshold}</Description>
                  )}
                </Item>
              );
            })}
          </Items>
        </>
      )}
      {!!permissions.length && (
        <>
          <Title variant='h4'>Пермиссии</Title>
          <Items>
            {permissions.map((permission) => (
              <PermissionDetailsView
                key={permission.id}
                variant='p3'
                permission={permission}
                roles={[]}
              />
            ))}
          </Items>
        </>
      )}
    </Container>
  );
};
