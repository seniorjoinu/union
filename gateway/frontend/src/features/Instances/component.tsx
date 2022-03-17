import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { Principal } from '@dfinity/principal';
import { Text, Button } from 'components';
import { useDeployer } from '../../services';

const List = styled.div`
  display: flex;
  flex-direction: column;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Instances = () => {
  const [spawning, setSpawning] = useState<boolean>(false);
  const [instances, setInstances] = useState<Principal[]>([]);
  const { canister, fetching } = useDeployer(process.env.UNION_DEPLOYER_CANISTER_ID);

  useEffect(() => {
    canister.get_spawned_instances().then(setInstances);
  }, []);

  const onCreate = useCallback(async () => {
    setSpawning(true);

    try {
      const res = await fetch('/union-wallet.wasm');
      const buffer = await res.arrayBuffer();
      const module = [...new Uint8Array(buffer)];

      await canister.spawn({ wasm_module: module });
      const instances = await canister.get_spawned_instances();

      setInstances(instances);
    } catch (e) {
      console.error(e);
    }
    setSpawning(false);
  }, [setInstances, setSpawning]);

  return (
    <Container>
      <Text>Spawned wallets {fetching.get_spawned_instances ? 'fetching' : ''}</Text>
      <Button disabled={spawning} onClick={onCreate}>
        Create wallet
      </Button>
      <List>
        {instances.map((i) => (
          <Text key={i.toString()}>{i.toString()}</Text>
        ))}
        {!instances.length && !fetching.get_spawned_instances && (
          <Text>There are no union wallets. You can create new wallet</Text>
        )}
      </List>
    </Container>
  );
};
