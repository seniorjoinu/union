import React from 'react';
import styled from 'styled-components';
import { PageWrapper, Text, Button as B } from 'components';
import { Profile } from 'wallet-ts';
import { NavLink } from 'react-router-dom';
import { useCurrentWallet } from '../context';
import { useFilteredRoles } from '../useRoles';

const Button = styled(B)``;

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

const Container = styled(PageWrapper)`
  ${Button} {
    margin-bottom: 24px;
    align-self: flex-end;
  }
`;

export const Participants = () => {
  const { rnp } = useCurrentWallet();
  const { roles, fetching } = useFilteredRoles<Profile>('Profile');

  return (
    <Container title='User profiles'>
      {/* {
        !current.fetching.get_my_roles && !current.roles.find(r => 'Profile' in r.role_type) &&
          <Button>Join to Union</Button>
      } */}
      {!!rnp && (
        <Button forwardedAs={NavLink} to='invite'>
          + Invite
        </Button>
      )}
      {fetching && <Text>fetching</Text>}
      {!fetching && !roles.length && <Text>Users does not exist</Text>}
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
