import React from 'react';
import styled from 'styled-components';
import { Text } from 'components';
import { LoginButton } from '../LoginButton';

const Items = styled(Text)`
  flex-grow: 1;
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
      <Items variant='h5' />
      {/* TODO frontend костыль */}
      <LoginButton mnemonic='' />
    </Container>
  );
}
