import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Principal } from '@dfinity/principal';
import { useNavigate } from 'react-router-dom';
import { PageWrapper, Text, SubmitButton as B, SimpleListItem } from 'components';
import { useDeployer, useGateway } from 'services';
import { WalletItem } from '../Wallets';

const List = styled.div`
  display: flex;
  flex-direction: column;

  & > *:not(:last-child) {
    margin-bottom: 16px;
  }
`;

const AttachButton = styled(B)``;

const Container = styled(PageWrapper)`
  ${List} {
    margin-top: 16px;
  }
`;

export const Explore = () => {
  const nav = useNavigate();
  const gateway = useGateway(process.env.GATEWAY_CANISTER_ID);
  const { canister, fetching, data } = useDeployer(process.env.UNION_DEPLOYER_CANISTER_ID);

  useEffect(() => {
    gateway.canister.get_attached_union_wallets();
    gateway.canister.get_controller();
    canister.get_instance_ids().then(({ ids }) => canister.get_instances({ ids }));
  }, []);

  const attached = gateway.data.get_attached_union_wallets?.wallet_ids;
  const handleAttach = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>, canisterId: Principal) => {
      e.stopPropagation();
      const isAttached = attached?.find((a) => a.toString() == canisterId.toString());

      if (isAttached) {
        await gateway.canister.detach_from_union_wallet({ union_wallet_id: canisterId });
      } else {
        await gateway.canister.attach_to_union_wallet({ union_wallet_id: canisterId });
      }
      return await gateway.canister.get_attached_union_wallets();
    },
    [gateway.canister, attached],
  );

  const instances = data.get_instances?.instances || [];
  const progress = !!fetching.get_instance_ids || !!fetching.get_instances;

  const rootWallet = gateway.data.get_controller;

  return (
    <Container title='Explore wallets'>
      <List>
        {instances.map(({ canister_id }) => (
          <WalletItem
            key={canister_id.toString()}
            rootWallet={rootWallet}
            wallet={canister_id}
            onClick={(wallet) => nav(`/wallet/${wallet.toString()}`)}
          >
            {!!attached && (
              <AttachButton onClick={(e) => handleAttach(e, canister_id)}>
                {attached?.find((a) => a.toString() == canister_id.toString())
                  ? 'Detach'
                  : 'Attach'}
              </AttachButton>
            )}
          </WalletItem>
        ))}
        {!instances.length && !progress && <Text>There are no union wallets</Text>}
        {progress && <Text>fetching</Text>}
      </List>
    </Container>
  );
};
