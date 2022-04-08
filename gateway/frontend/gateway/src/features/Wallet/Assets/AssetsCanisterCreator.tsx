import React from 'react';
import styled from 'styled-components';
import { Button as B } from 'components';
import { useCreateAssetsCanister } from './useSpawnCanister';

const Button = styled(B)``;
const Container = styled.div`
  display: flex;
  flex-direction: column;

  ${Button} {
    align-self: flex-end;
  }
`;

export interface AssetsCanisterCreatorProps {
  className?: string;
  style?: React.CSSProperties;
}

export const AssetsCanisterCreator = ({ ...p }: AssetsCanisterCreatorProps) => {
  const { createCanister } = useCreateAssetsCanister();

  return (
    <Container {...p}>
      <Button type='submit' onClick={createCanister}>
        + Create assets canister
      </Button>
    </Container>
  );
};
