import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Principal } from '@dfinity/principal';
import { NavLink, useNavigate } from 'react-router-dom';
import { Text, SubmitButton as B, SimpleListItem } from 'components';
import { useDeployer, useGateway } from 'services';

const Title = styled(Text)``;
const List = styled.div`
  display: flex;
  flex-direction: column;

  & > *:not(:last-child) {
    margin-bottom: 16px;
  }
`;

const AttachButton = styled(B)``;

const Container = styled.div`
  display: flex;
  flex-direction: column;

  ${Title} {
    margin-bottom: 64px;
  }
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

  const rootWallet = gateway.data.get_controller?.toString() || '';

  return (
    <Container>
      <Title variant='h2'>Explore wallets</Title>
      <List>
        {instances.map(({ canister_id }) => (
          <SimpleListItem
            key={canister_id.toString()}
            item={{
              id: canister_id.toString(),
              principal: <Text variant='p1'>{canister_id.toString()}</Text>,
              isRoot: rootWallet == canister_id.toString() && (
                <Text variant='p1' color='grey'>
                  Root
                </Text>
              ),
              attach: !!attached && (
                <AttachButton onClick={(e) => handleAttach(e, canister_id)}>
                  {attached?.find((a) => a.toString() == canister_id.toString())
                    ? 'Detach'
                    : 'Attach'}
                </AttachButton>
              ),
            }}
            order={[
              { key: 'principal', basis: '30%' },
              { key: 'isRoot', basis: '30%' },
              { key: 'attach', align: 'end' },
            ]}
            onClick={() => nav(`/wallet/${canister_id.toString()}`)}
          />
        ))}
        {!instances.length && !progress && <Text>There are no union wallets</Text>}
        {progress && <Text>fetching</Text>}
      </List>
    </Container>
  );
};
