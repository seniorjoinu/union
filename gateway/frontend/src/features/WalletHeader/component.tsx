import React, { useEffect, useMemo } from 'react';
import { Chips, Row, Text, CopyableText } from '@union/components';
import { NavLink, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useUnion } from 'services';
import { Principal } from '@dfinity/principal';
import { checkPrincipal } from 'toolkit';

const Name = styled(Chips)`
  padding: 0 8px;
`;

const WalletInfo = styled(Row)``;
const WalletId = styled(Text)`
  cursor: pointer;
  color: ${({ theme }) => theme.colors.grey};

  &:hover {
    color: ${({ theme }) => theme.colors.dark};
  }
`;
const Item = styled(Text)`
  text-decoration: none;
  color: #${({ theme }) => theme.colors.grey};

  &.active {
    color: ${({ theme }) => theme.colors.dark};
    font-weight: 500;
  }
`;

const Items = styled(Text)`
  display: flex;
  flex-direction: row;
  flex-grow: 1;

  & > *:not(:last-child) {
    margin-right: 8px;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 4px 16px;

  &:empty {
    display: none;
  }
`;

export interface WalletHeaderProps {
  className?: string;
  style?: React.CSSProperties;
}

export const WalletHeader = ({ ...p }: WalletHeaderProps) => {
  const param = useParams();
  const location = param['*'] || '';

  const isInsideWallet = location.startsWith('wallet/');
  const walletId = location.split('wallet/')[1]?.split('/')[0];
  const { data, canister } = useUnion(walletId ? Principal.from(walletId) : Principal.anonymous());

  useEffect(() => {
    if (!checkPrincipal(walletId)) {
      return;
    }
    canister.get_my_profile();
  }, [walletId, canister]);

  const profileName = useMemo(() => {
    if (!isInsideWallet || !walletId) {
      return '';
    }
    // TODO get groups
    return data.get_my_profile?.profile.name || '';
  }, [data.get_my_profile, isInsideWallet && walletId]);

  return (
    <Container {...p}>
      {isInsideWallet && walletId && (
        <>
          <Items>
            <Item variant='p2' as={NavLink} to={`wallet/${walletId}/profile`}>
              Profile
            </Item>
            <Item variant='p2' as={NavLink} to={`wallet/${walletId}/wallet`}>
              Wallet
            </Item>
            <Item variant='p2' as={NavLink} to={`wallet/${walletId}/groups`}>
              Groups
            </Item>
            <Item variant='p2' as={NavLink} to={`wallet/${walletId}/permissions`}>
              Permissions
            </Item>
            <Item variant='p2' as={NavLink} to={`wallet/${walletId}/access-configs`}>
              Access
            </Item>
            <Item variant='p2' as={NavLink} to={`wallet/${walletId}/voting-configs`}>
              Voting
            </Item>
            <Item variant='p2' as={NavLink} to={`wallet/${walletId}/assets`}>
              Assets
            </Item>
            <Item variant='p2' as={NavLink} to={`wallet/${walletId}/history`}>
              History
            </Item>
          </Items>
          <WalletInfo>
            {profileName && <Name>{profileName}</Name>}
            <CopyableText variant='p2'>{walletId}</CopyableText>
          </WalletInfo>
        </>
      )}
    </Container>
  );
};
