import React from 'react';
import styled from 'styled-components';
import { Role } from 'wallet-ts';
import { Text } from 'components';
import { parsePermission, parseRole } from '../utils';
import { useAttachedPermissions } from '../RolesAndPermissions/useAttachedPermissions';

const Title = styled(Text)``;
const Description = styled(Text)``;
const Item = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid grey;
  border-radius: 4px;
  padding: 8px 16px;

  & > *:not(:last-child) {
    margin-bottom: 8px;
  }
`;

const Target = styled.div`
  display: flex;
  flex-direction: column;
  border-top: 1px solid grey;
  border-bottom: 1px solid grey;
  padding: 8px 16px;

  & > *:not(:last-child) {
    margin-bottom: 8px;
  }
`;

const Items = styled.div`
  display: flex;
  flex-direction: column;

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

export interface RoleDetailsViewProps {
  role: Role;
  enumerated: Role[];
}

export const RoleDetailsView = ({ role, enumerated }: RoleDetailsViewProps) => {
  const { permissions } = useAttachedPermissions({ role });

  const parsedRole = parseRole(role.role_type);

  return (
    <Container>
      <Title variant='h2'>{parsedRole.title}</Title>
      <Description variant='p1'>Описание: {parsedRole.description}</Description>
      <Description variant='p1'>Тип: {parsedRole.type}</Description>
      {!!parsedRole.principal && (
        <Description variant='p1'>Принципал: {parsedRole.principal}</Description>
      )}
      {!!parsedRole.threshold && (
        <Description variant='p1'>Пороговое значение: {parsedRole.threshold}</Description>
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
            {permissions.map((permission) => {
              const parsed = parsePermission(permission);

              return (
                <Item key={String(role.id)}>
                  <Text variant='p3'>Имя: {parsed.name}</Text>
                  <Text variant='p3'>Скоуп: {parsed.scope}</Text>
                  {!!parsed.targets.length && (
                    <>
                      <Text variant='p2'>Цели</Text>
                      {parsed.targets.map((t) => (
                        <Target>
                          {t.principal && <Text variant='p3'>Канистер: {t.principal}</Text>}
                          {t.canisterId && <Text variant='p3'>Канистер: {t.canisterId}</Text>}
                          {t.method && <Text variant='p3'>Метод: {t.method}</Text>}
                          <Text variant='p3'>{t.type}</Text>
                        </Target>
                      ))}
                    </>
                  )}
                </Item>
              );
            })}
          </Items>
        </>
      )}
    </Container>
  );
};
