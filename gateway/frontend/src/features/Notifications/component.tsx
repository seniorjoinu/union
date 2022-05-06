import React, { useCallback, useEffect, useState } from 'react';
import { useGateway, initWalletController } from 'services';
import { Text, PageWrapper, SubmitButton as B } from 'components';
import styled from 'styled-components';
import { Role } from 'union-ts';
import { Principal } from '@dfinity/principal';
import { parseRole } from '../Wallet/utils';

const AcceptButton = styled(B)``;

const Item = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 8px;
  border: 1px solid grey;

  & > *:not(:last-child) {
    margin-bottom: 8px;
  }
`;

const Container = styled(PageWrapper)`
  ${Item}:not(:last-child) {
    margin-bottom: 8px;
  }
`;

export interface NotificationsProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Notifications = ({ ...p }: NotificationsProps) => {
  const [accepted, setAccepted] = useState<Record<string, true>>({});
  const [rolesByCanister, setRolesByCanister] = useState<Record<string, Role>>({});
  const { canister, fetching, data } = useGateway(process.env.GATEWAY_CANISTER_ID);

  useEffect(() => {
    canister.get_my_notifications();
  }, []);

  const notifications = data.get_my_notifications?.notifications || [];

  useEffect(() => {
    // FIXME do not fetch already fetched roles
    if (!notifications.length) {
      return;
    }

    const rolesByWallets = notifications.reduce((acc, { union_wallet_id, role_id }) => {
      const canisterId = union_wallet_id.toString();

      return { ...acc, [canisterId]: [...(acc[canisterId] || []), role_id] };
    }, {} as Record<string, number[]>);

    Promise.all(
      Object.entries(rolesByWallets).map(async ([canisterId, ids]) => {
        const controller = initWalletController(canisterId);

        return { canisterId, response: await controller.canister.get_roles({ ids }) };
      }),
    ).then((results) => {
      const rolesByCanister: Record<string, Role> = {};

      results.forEach(({ canisterId, response: { roles } }) => {
        roles.forEach((role) => (rolesByCanister[`${canisterId}_${role.id}`] = role));
      });

      setRolesByCanister(rolesByCanister);
    });
  }, [notifications, setRolesByCanister]);

  const handleAccept = useCallback(
    async (id: string, canisterId: string, roleId: number) => {
      await initWalletController(canisterId).canister.activate_profile({ role_id: roleId });
      await canister.attach_to_union_wallet({ union_wallet_id: Principal.fromText(canisterId) });
      setAccepted((accepted) => ({ ...accepted, [id]: true }));
    },
    [canister, setAccepted],
  );

  return (
    <Container {...p} title='Notifications'>
      {!!fetching.get_my_notifications && <Text>fetching</Text>}
      {!fetching.get_my_notifications && !notifications.length && (
        <Text>Notifications list is empty</Text>
      )}
      {notifications.map(({ id, union_wallet_id, role_id }) => {
        const canisterId = union_wallet_id.toString();
        const role = rolesByCanister[`${canisterId}_${role_id}`];
        const parsedRole = role ? parseRole(role.role_type) : null;

        return (
          <Item key={String(id)}>
            <Text>
              Assigned role: {parsedRole?.title} ({String(role_id)})
            </Text>
            <Text>Wallet: {union_wallet_id.toString()}</Text>
            {!accepted[String(id)] && parsedRole?.type == 'Profile' && (
              <AcceptButton onClick={() => handleAccept(String(id), canisterId, role_id)}>
                Accept
              </AcceptButton>
            )}
          </Item>
        );
      })}
    </Container>
  );
};
