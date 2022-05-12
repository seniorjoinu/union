import React, { useCallback, useEffect, useState } from 'react';
import { useGateway, initWalletController } from 'services';
import { Text, PageWrapper, SubmitButton as B } from '@union/components';
import styled from 'styled-components';
import { Principal } from '@dfinity/principal';

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
  const { canister, fetching, data } = useGateway(process.env.GATEWAY_CANISTER_ID);

  useEffect(() => {
    canister.get_my_notifications();
  }, []);

  const notifications = data.get_my_notifications?.notifications || [];

  const handleAccept = useCallback(
    async (id: string, canisterId: string) => {
      // FIXME
      console.error('FIXME role_id');
      await initWalletController(canisterId).canister.activate_profile({ role_id: 0 });
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
