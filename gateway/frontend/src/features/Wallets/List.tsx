import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Principal } from '@dfinity/principal';
import { NavLink, useNavigate } from 'react-router-dom';
import { Text, Button as B, SimpleListItem } from 'components';
import { useDeployer } from '../../services';

const List = styled.div`
  display: flex;
  flex-direction: column;

  & > *:not(:last-child) {
    margin-bottom: 16px;
  }
`;

const Panel = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const Button = styled(B)``;

const Container = styled.div`
  display: flex;
  flex-direction: column;

  ${List} {
    margin-top: 16px;
  }
`;

export const WalletsList = () => {
  const nav = useNavigate();
  const [wallets, setWallets] = useState<Principal[]>([]);
  const { canister, fetching } = useDeployer(process.env.UNION_DEPLOYER_CANISTER_ID);

  useEffect(() => {
    canister.get_spawned_instances().then(setWallets);
  }, []);

  return (
    <Container>
      <Panel>
        <Text>Spawned wallets {fetching.get_spawned_instances ? 'fetching' : ''}</Text>
        <Button forwardedAs={NavLink} to='/wallets/create'>
          Create wallet
        </Button>
      </Panel>
      <List>
        {wallets.map((wallet) => (
          <SimpleListItem
            key={wallet.toString()}
            item={{
              id: wallet.toString(),
              principal: <Text variant='p1'>{wallet.toString()}</Text>,
            }}
            order={[{ key: 'principal', basis: '30%' }]}
            onClick={() => nav(`/wallet/${wallet.toString()}`)}
          />
        ))}
        {!wallets.length && !fetching.get_spawned_instances && (
          <Text>There are no union wallets. You can create new wallet</Text>
        )}
      </List>
    </Container>
  );
};
