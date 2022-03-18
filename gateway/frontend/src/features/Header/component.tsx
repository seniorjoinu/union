import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
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

  ${Items} {
    margin-left: 24px;
  }
`;

export function Header() {
  return (
    <Container>
      <Items variant='h5'>
        <Text as={NavLink} to='/wallet'>
          Home
        </Text>
        <Text as={NavLink} to='/wallets'>
          Wallets
        </Text>
      </Items>
      {/* TODO frontend костыль */}
      <LoginButton mnemonic='' />
    </Container>
  );
}
