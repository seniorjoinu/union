import React from 'react';
import { Text } from '@union/components';
import { NavLink, useParams } from 'react-router-dom';
import styled from 'styled-components';

const WalletInfo = styled(Text)`
  color: #acacac;
`;
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
            <Item variant='p2' as={NavLink} to={`wallet/${walletId}/assets`}>
              Assets
            </Item>
            <Item variant='p2' as={NavLink} to={`wallet/${walletId}/history`}>
              History
            </Item>
          </Items>
          <WalletInfo variant='p2'>{walletId}</WalletInfo>
        </>
      )}
    </Container>
  );
};
