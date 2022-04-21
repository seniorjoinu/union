import React, { useEffect } from 'react';
import { Text } from 'components';
import { useWallet } from 'services';
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
  canisterId: string;
}

export const WalletInfo = ({ canisterId, ...p }: WalletInfoProps) => {
  const { canister, data } = useWallet(canisterId);

  useEffect(() => {
    canister.get_info();
  }, []);

  if (!data.get_info) {
    return <Text>fetching...</Text>;
  }

  const { info } = data.get_info;

  return (
    <Container {...p}>
      <Text weight='medium'>{info.name}</Text>
      <Text>{canisterId}</Text>
    </Container>
  );
};
