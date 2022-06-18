import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Principal } from '@dfinity/principal';
import { NavLink, useNavigate } from 'react-router-dom';
import { PageWrapper, Text, Button as B, Spinner } from '@union/components';
import { useGateway } from 'services';
import { WalletItem } from './WalletItem';

const List = styled.div`
  display: flex;
  flex-direction: column;

  & > *:not(:last-child) {
    margin-bottom: 16px;
  }

  & > ${Spinner} {
    align-self: center;
  }
`;

const Panel = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
`;

const Button = styled(B)``;

const Container = styled(PageWrapper)`
  ${List} {
    margin-top: 16px;
  }
`;

export const WalletsList = () => {
  const nav = useNavigate();
  const [wallets, setWallets] = useState<Principal[]>([]);
  const { canister, fetching, data } = useGateway(process.env.GATEWAY_CANISTER_ID);

  useEffect(() => {
    canister.get_controller();
    canister.get_attached_union_wallets().then(({ wallet_ids }) => setWallets(wallet_ids));
  }, []);

  const rootWallet = data.get_controller;
  const loading = !!fetching.get_controller || !!fetching.get_attached_union_wallets;

  return (
    <Container title='Union organizations'>
      <Panel>
        <Button forwardedAs={NavLink} to='/wallets/create'>
          + Create new digital organization
        </Button>
      </Panel>
      <List>
        {wallets.map((wallet) => (
          <WalletItem
            key={wallet.toString()}
            rootWallet={rootWallet}
            wallet={wallet}
            onClick={(wallet) => nav(`/wallet/${wallet.toString()}`)}
          />
        ))}
        {!!fetching.get_attached_union_wallets && <Spinner size={20} />}
        {!wallets.length && !loading && (
          <Text>There are no digital organizations. You can create new wallet</Text>
        )}
        {loading && <Text>Fetching...</Text>}
      </List>
    </Container>
  );
};
