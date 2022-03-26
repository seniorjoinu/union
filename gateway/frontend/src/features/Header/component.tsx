import React from 'react';
import styled from 'styled-components';
import { NavLink, useParams } from 'react-router-dom';
import { Text } from 'components';
import { LoginButton } from '../LoginButton';

const Items = styled(Text)`
  display: flex;
  flex-direction: row;
  flex-grow: 1;

  & > *:not(:last-child) {
    margin-right: 16px;
  }
`;

const Container = styled.div`
  position: static;
  z-index: 100;
  max-height: 56px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 8px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark[900]};
`;

export function Header(p: IClassName) {
  const param = useParams();
  const location = param['*'] || '';

  const isInsideWallet = location.startsWith('wallet/');
  const walletId = location.split('wallet/')[1]?.split('/')[0];

  return (
    <Container {...p}>
      <Items>
        <Text variant='p1' as={NavLink} to='/wallets'>
          Wallets
        </Text>
        {isInsideWallet && walletId && (
          <>
            <Text variant='p1' as={NavLink} to={`wallet/${walletId}/participants`}>
              Participants
            </Text>
            <Text variant='p1' as={NavLink} to={`wallet/${walletId}/my-rnp`}>
              My roles
            </Text>
            <Text variant='p1' as={NavLink} to={`wallet/${walletId}/rnp`}>
              Roles and Permissions
            </Text>
            <Text variant='p1' as={NavLink} to={`wallet/${walletId}/invite`}>
              Invite
            </Text>
            <Text variant='p1' as={NavLink} to={`wallet/${walletId}/manual-execute`}>
              Execute
            </Text>
          </>
        )}
      </Items>
      {/* TODO frontend костыль */}
      <LoginButton mnemonic='' />
    </Container>
  );
}
