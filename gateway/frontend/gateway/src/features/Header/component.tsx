import React, { useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { NavLink, useParams } from 'react-router-dom';
import { Text } from 'components';
import { useDeployer, useWallet } from 'services';
import { checkPrincipal } from 'toolkit';
import { LoginButton } from '../Auth/LoginButton';

const Item = styled(Text)`
  text-decoration: none;
  color: #575757;

  &.active {
    color: black;
    font-weight: 500;
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
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark[900]};
`;

export interface HeaderProps extends IClassName {}

export function Header(p: HeaderProps) {
  const param = useParams();
  const location = param['*'] || '';

  const isInsideWallet = location.startsWith('wallet/');
  const walletId = location.split('wallet/')[1]?.split('/')[0];
  const { data, canister } = useWallet(walletId);

  useEffect(() => {
    if (!checkPrincipal(walletId)) {
      return;
    }
    canister.get_my_roles();
  }, [walletId, canister]);

  const profileName = useMemo(() => {
    if (!isInsideWallet || !walletId) {
      return '';
    }
    const roles = data.get_my_roles?.roles || [];
    const profile = roles.find((r) => 'Profile' in r.role_type);

    return profile && 'Profile' in profile.role_type ? profile.role_type.Profile.name : '';
  }, [data.get_my_roles, isInsideWallet && walletId]);

  return (
    <Container {...p}>
      <Items>
        <Item variant='p1' as={NavLink} to='/wallets'>
          Wallets
        </Item>
        <Item variant='p1' as={NavLink} to='/notifications'>
          Notifications
        </Item>
        <Item variant='p1' as={NavLink} to='/versions'>
          Versions
        </Item>
        <Item variant='p1' as={NavLink} to='/explore'>
          Explore
        </Item>
      </Items>
      <LoginButton name={profileName} />
    </Container>
  );
}
