import React from 'react';
import styled from 'styled-components';
import { Text } from 'components';
import { Profile } from 'wallet-ts';
import { useFilteredRoles } from './useRoles';

const Title = styled(Text)``;

const Item = styled.div`
  display: flex;
  flex-direction: row;

  & > *:not(:last-child) {
    margin-right: 16px;
  }
`;

const Items = styled.div`
  display: flex;
  flex-direction: column;

  & > *:not(:last-child) {
    margin-bottom: 24px;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;

  ${Title} {
    margin-bottom: 16px;
  }
`;

export const Participants = () => {
  const { roles, fetching } = useFilteredRoles<Profile>('Profile');

  return (
    <Container>
      <Title variant='h2'>Профили пользователей</Title>
      {/* Самостоятельное вступление пока не предусмотрено */}
      {/* {
        !current.fetching.get_my_roles && !current.roles.find(r => 'Profile' in r.role_type) &&
          <Button>Вступить в Union</Button>
      } */}
      {fetching && <Text>fetching</Text>}
      {!!roles.length && (
        <Items>
          {roles.map((p) => (
            <Item key={p.principal_id.toString()}>
              {p.name} {p.principal_id.toString()}
            </Item>
          ))}
        </Items>
      )}
    </Container>
  );
};
