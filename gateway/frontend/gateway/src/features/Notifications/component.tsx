import React, { useEffect } from 'react';
import { useGateway } from 'services';
import { Text } from 'components';
import styled from 'styled-components';

const Title = styled(Text)``;

const Container = styled.div`
  display: flex;
  flex-direction: column;

  ${Title} {
    margin-bottom: 64px;
  }
`;

export interface NotificationsProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Notifications = ({ ...p }: NotificationsProps) => {
  const { canister, fetching, data } = useGateway(process.env.GATEWAY_CANISTER_ID);

  useEffect(() => {
    canister.get_my_notifications();
  }, []);

  return (
    <Container {...p}>
      <Title variant='h2'>Notifications</Title>
      {!!fetching.get_my_notifications && <Text>fetching</Text>}
      {data.get_my_notifications?.notifications.map((n) => (
        <Text key={String(n.id)}>{JSON.stringify(n)}</Text>
      ))}
    </Container>
  );
};
