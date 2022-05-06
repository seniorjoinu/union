import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Principal } from '@dfinity/principal';
import { useNavigate } from 'react-router-dom';
import { PageWrapper, Text, SubmitButton as B } from 'components';
import { useGateway } from 'services';
import { checkPrincipal } from 'toolkit';
import { useClient } from '../useClient';
import { WalletItem } from './WalletItem';

const List = styled.div`
  display: flex;
  flex-direction: column;

  & > *:not(:last-child) {
    margin-bottom: 16px;
  }
`;

const AuthButton = styled(B)``;

const Container = styled(PageWrapper)`
  ${List} {
    margin-top: 16px;
  }
`;

export const AuthorizeWallet = () => {
  const nav = useNavigate();
  const client = useClient({ parser });
  const [wallets, setWallets] = useState<Principal[]>([]);
  const { canister, fetching, data } = useGateway(process.env.GATEWAY_CANISTER_ID);

  useEffect(() => {
    canister.get_controller();
    canister.get_attached_union_wallets().then(({ wallet_ids }) => setWallets(wallet_ids));
  }, []);

  const handleAuth = useCallback(
    async (e: React.MouseEvent, wallet: Principal) => {
      e.stopPropagation();

      // TODO make call to wallet to get proof for principal
      const payload = { proof: [1, 2, 3], union: wallet.toString() };
      const principal = client.data;

      if (!principal) {
        console.error('No principal passed from opener window');
        return;
      }

      await client.success(payload);
    },
    [client.data, client.success],
  );

  const rootWallet = data.get_controller;
  const loading = !!fetching.get_controller || !!fetching.get_attached_union_wallets;

  return (
    <Container title='Authorize with wallet'>
      <List>
        {wallets.map((wallet) => (
          <WalletItem
            key={wallet.toString()}
            rootWallet={rootWallet}
            wallet={wallet}
            onClick={(wallet) => nav(`/wallet/${wallet.toString()}`)}
          >
            <AuthButton onClick={(e) => handleAuth(e, wallet)}>Authorize</AuthButton>
          </WalletItem>
        ))}
        {!wallets.length && !loading && (
          <Text>There are no union wallets. You can create new wallet</Text>
        )}
        {loading && <Text>Fetching...</Text>}
      </List>
    </Container>
  );
};

const parser = (payload: any) => {
  if (!payload) {
    return null;
  }
  const principal = checkPrincipal(payload.principal);

  return principal;
};
