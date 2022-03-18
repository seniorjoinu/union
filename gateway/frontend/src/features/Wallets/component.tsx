import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { Principal } from '@dfinity/principal';
import { Text, Button as B, SimpleListItem, CroppedString } from 'components';
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

export const Wallets = () => {
  const [spawning, setSpawning] = useState<boolean>(false);
  const [wallets, setWallets] = useState<Principal[]>([]);
  const { canister, fetching } = useDeployer(process.env.UNION_DEPLOYER_CANISTER_ID);

  useEffect(() => {
    canister.get_spawned_instances().then(setWallets);
  }, []);

  const onCreate = useCallback(async () => {
    setSpawning(true);

    try {
      const res = await fetch('/union-wallet.wasm');
      const buffer = await res.arrayBuffer();
      const module = [...new Uint8Array(buffer)];

      await canister.spawn({ wasm_module: module });
      const wallets = await canister.get_spawned_instances();

      setWallets(wallets);
    } catch (e) {
      console.error(e);
    }
    setSpawning(false);
  }, [setWallets, setSpawning]);

  return (
    <Container>
      <Panel>
        <Text>Spawned wallets {fetching.get_spawned_instances ? 'fetching' : ''}</Text>
        <Button disabled={spawning} onClick={onCreate}>
          Create wallet
        </Button>
      </Panel>
      <List>
        {wallets.map((wallet) => (
          <SimpleListItem
            key={wallet.toString()}
            item={{
              id: wallet.toString(),
              principal: (
                <CroppedString variant='p1' startLen={9} endLen={4}>
                  {wallet.toString()}
                </CroppedString>
              ),
            }}
            order={[{ key: 'principal', basis: '30%' }]}
            // onClick={() => {
            //   h.push(`company/${d.canisterId}`);
            // }}
          />
        ))}
        {!wallets.length && !fetching.get_spawned_instances && (
          <Text>There are no union wallets. You can create new wallet</Text>
        )}
      </List>
    </Container>
  );
};
