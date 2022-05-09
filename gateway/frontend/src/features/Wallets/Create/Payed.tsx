import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { PageWrapper, Button as B, Text } from '@union/components';
import { Principal } from '@dfinity/principal';

const Item = styled(Text)``;
const Info = styled(Text)``;
const Button = styled(B)``;

const Center = styled.div`
  display: flex;
  flex-direction: column;
`;

const Container = styled(PageWrapper)`
  ${Center} {
    align-self: center;
    max-width: 700px;
  }

  ${Item} {
    margin-bottom: 8px;

    span {
      color: green;
    }
  }
  ${Info} {
    margin-top: 24px;
  }
  ${Button} {
    align-self: center;
    margin-top: 24px;
  }
`;

export interface PayedProps {
  wallet: Principal | null;
}

export const Payed = ({ wallet }: PayedProps) => (
  <Container title='Union-wallet creation'>
    <Item variant='p2'>
      Status: <span>Payed</span>
    </Item>
    <Item variant='p2'>Account: -</Item>
    {wallet && (
      <Button forwardedAs={NavLink} to={`/wallet/${wallet.toString()}`}>
        Go to union-wallet
      </Button>
    )}
  </Container>
);
