import React, { useCallback, useEffect, useState } from 'react';
import { useGateway, initUnionController } from 'services';
import { Text, PageWrapper, SubmitButton as B } from '@union/components';
import styled from 'styled-components';
import { Principal } from '@dfinity/principal';

const AcceptButton = styled(B)``;

const Item = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 8px;
  border: 1px solid ${({ theme }) => theme.colors.grey};

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
  const { canister: gateway, fetching, data } = useGateway(process.env.GATEWAY_CANISTER_ID);

  useEffect(() => {
    gateway.get_my_notifications();
  }, []);

  const notifications = data.get_my_notifications?.notifications || [];

  const handleAccept = useCallback(
    async (id: string, canisterId: string) => {
      const { canister } = initUnionController(canisterId);

      const groups = await canister.get_my_groups();

      const responses = await Promise.all(
        groups.groups.map(async ({ it: group }) => {
          if (!group.id[0]) {
            return;
          }
          const shares = await canister.get_my_unaccepted_group_shares_balance({
            group_id: group.id[0],
          });

          if (!Number(shares.balance)) {
            return;
          }
          return canister.accept_my_group_shares({ group_id: group.id[0], qty: shares.balance });
        }),
      );

      console.log('Accept responses', responses);
      await gateway.attach_to_union_wallet({ union_wallet_id: Principal.fromText(canisterId) });
      setAccepted((accepted) => ({ ...accepted, [id]: true }));
    },
    [gateway, setAccepted],
  );

  return (
    <Container {...p} title='Notifications'>
      {!!fetching.get_my_notifications && <Text>fetching</Text>}
      {!fetching.get_my_notifications && !notifications.length && (
        <Text>Notifications list is empty</Text>
      )}
      {notifications.map(({ id, union_wallet_id }) => {
        const canisterId = union_wallet_id.toString();

        return (
          <Item key={String(id)}>
            <Text>Wallet: {union_wallet_id.toString()}</Text>
            {!accepted[String(id)] && (
              <AcceptButton onClick={() => handleAccept(String(id), canisterId)}>
                Accept
              </AcceptButton>
            )}
          </Item>
        );
      })}
    </Container>
  );
};
