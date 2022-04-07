import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Principal } from '@dfinity/principal';
import { NavLink, useNavigate } from 'react-router-dom';
import { Text, Button as B, SimpleListItem } from 'components';
import { initWalletController, useGateway } from 'services';
import { parseRole } from '../Wallet/utils';

const RoleName = styled(Text)`
  padding: 0 8px;
  border-radius: 4px;
  background-color: #dfdfdf;
`;
const Title = styled(Text)``;
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

  ${Title} {
    margin-bottom: 64px;
  }
  ${List} {
    margin-top: 16px;
  }
`;

export const WalletsList = () => {
  const nav = useNavigate();
  const [wallets, setWallets] = useState<Principal[]>([]);
  const [roleNames, setRoleNames] = useState<Record<string, string | undefined>>({});
  const { canister, fetching, data } = useGateway(process.env.GATEWAY_CANISTER_ID);

  useEffect(() => {
    canister.get_controller();
    canister.get_attached_union_wallets().then(({ wallet_ids }) => setWallets(wallet_ids));
  }, []);

  useEffect(() => {
    Promise.all(
      wallets.map(async (walletId) => {
        const canisterId = walletId.toString();
        const controller = initWalletController(canisterId);
        const { roles } = await controller.canister.get_my_roles();

        const profile = roles.find((r) => 'Profile' in r.role_type);
        const everyone = roles.find((r) => 'Everyone' in r.role_type);

        const roleType = profile?.role_type || everyone?.role_type;
        const parsed = roleType ? parseRole(roleType) : null;

        return { canisterId, roleName: parsed?.title };
      }),
    ).then((results) => {
      const roleNames = results.reduce(
        (acc, next) => ({ ...acc, [next.canisterId]: next.roleName }),
        {} as Record<string, string | undefined>,
      );

      setRoleNames(roleNames);
    });
  }, [wallets, setRoleNames]);

  const rootWallet = data.get_controller?.toString() || '';

  return (
    <Container>
      <Title variant='h2'>Ваши union-кошельки</Title>
      <Panel>
        <Text>Spawned wallets {fetching.get_attached_union_wallets ? 'fetching' : ''}</Text>
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
              isRoot: rootWallet == wallet.toString() && (
                <Text variant='p1' color='grey'>
                  Корневой
                </Text>
              ),
              roleName: roleNames[wallet.toString()] && (
                <RoleName variant='p1'>{roleNames[wallet.toString()]}</RoleName>
              ),
            }}
            order={[
              { key: 'principal', basis: '50%' },
              { key: 'isRoot', basis: '20%' },
              { key: 'roleName', basis: '30%', align: 'end' },
            ]}
            onClick={() => nav(`/wallet/${wallet.toString()}`)}
          />
        ))}
        {!wallets.length && !fetching.get_attached_union_wallets && (
          <Text>There are no union wallets. You can create new wallet</Text>
        )}
      </List>
    </Container>
  );
};
