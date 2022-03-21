import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { Button as B, Text } from 'components';
import { Principal } from '@dfinity/principal';

const Title = styled(Text)``;
const Item = styled(Text)``;
const Info = styled(Text)``;
const Button = styled(B)``;

const Center = styled.div`
  display: flex;
  flex-direction: column;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;

  ${Center} {
    align-self: center;
    max-width: 700px;
  }

  ${Title} {
    margin-bottom: 32px;
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
  <Container>
    <Title variant='h3'>Заявка на создание юнион-кошелька</Title>
    <Item variant='p2'>
      Статус: <span>Оплачено</span>
    </Item>
    <Item variant='p2'>Идентификатор: -</Item>
    {wallet && (
      <Button forwardedAs={NavLink} to={`/wallet/${wallet.toString()}`}>
        Перейти в юнион-кошелек
      </Button>
    )}
  </Container>
);
