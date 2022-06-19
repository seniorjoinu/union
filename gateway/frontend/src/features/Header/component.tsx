import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { Text } from '@union/components';
import { LoginButton } from '../Auth/LoginButton';

const Item = styled(Text)`
  text-decoration: none;
  color: #575757;

  &.active {
    color: ${({ theme }) => theme.colors.dark};
    font-weight: 600;
  }
`;

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
  max-height: 48px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark};
`;

export interface HeaderProps extends IClassName {}

export function Header(p: HeaderProps) {
  return (
    <Container {...p}>
      <Items>
        <Item variant='p1' as={NavLink} to='/wallets'>
          Organizations
        </Item>
        {/* <Item variant='p1' as={NavLink} to='/notifications'>
          Notifications
        </Item> */}
        <Item variant='p1' as={NavLink} to='/versions'>
          Versions
        </Item>
        {/* <Item variant='p1' as={NavLink} to='/explore'>
          Explore
        </Item> */}
      </Items>
      <LoginButton />
    </Container>
  );
}
