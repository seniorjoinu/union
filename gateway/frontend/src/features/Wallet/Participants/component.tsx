import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Text } from 'components';
import { useTrigger } from 'toolkit';
import { useCurrentWallet } from '../context';
import { useWallet } from '../../../services';
import { parseRole } from '../utils';

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
  const { rnp, principal } = useCurrentWallet();
  const { canister, fetching, data } = useWallet(principal);

  useTrigger(
    (rnp) => {
      canister.get_role_ids({ rnp }).then(({ ids }) => canister.get_roles({ rnp, ids }));
    },
    rnp,
    [],
  );

  const roles = useMemo(
    () => (data.get_roles?.roles || []).filter((r) => 'Profile' in r.role_type),
    [data.get_roles],
  );

  return (
    <Container>
      <Title variant='h2'>Профили пользователей</Title>
      {/* Самостоятельное вступление пока не предусмотрено */}
      {/* {
        !current.fetching.get_my_roles && !current.roles.find(r => 'Profile' in r.role_type) &&
          <Button>Вступить в Union</Button>
      } */}
      {(fetching.get_role_ids || fetching.get_roles) && <Text>fetching</Text>}
      {!!roles.length && (
        <Items>
          {roles.map((r) => {
            const role = parseRole(r.role_type);

            return (
              <Item key={r.id}>
                {role.title} {role.principal}
              </Item>
            );
          })}
        </Items>
      )}
    </Container>
  );
};
