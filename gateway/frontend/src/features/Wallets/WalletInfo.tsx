import React, { useEffect } from 'react';
import { Principal } from '@dfinity/principal';
import { Text } from '@union/components';
import { useUnion } from 'services';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;

  & > *:not(:last-child) {
    margin-bottom: 8px;
  }
`;

export interface WalletInfoProps {
  className?: string;
  style?: React.CSSProperties;
  canisterId: Principal;
}

export const WalletInfo = ({ canisterId, ...p }: WalletInfoProps) => {
  const { canister, data } = useUnion(canisterId);

  useEffect(() => {
    canister.get_settings();
  }, []);

  if (!data.get_settings) {
    return <Text>fetching...</Text>;
  }

  const { settings } = data.get_settings;

  return (
    <Container {...p}>
      <Text weight='medium'>{settings.name}</Text>
      <Text>{canisterId.toString()}</Text>
    </Container>
  );
};
