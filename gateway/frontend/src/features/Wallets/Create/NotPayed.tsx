import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { Principal } from '@dfinity/principal';
import { Button as B, Text } from 'components';
import { useDeployer } from '../../../services';

const Button = styled(B)``;
const Title = styled(Text)``;
const Item = styled(Text)``;
const Info = styled(Text)``;

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
      color: red;
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

export interface NotPayedProps {
  onApproved(principal: Principal | null): void;
}

export const NotPayed = ({ onApproved }: NotPayedProps) => {
  const [spawning, setSpawning] = useState<boolean>(false);
  const { canister } = useDeployer(process.env.UNION_DEPLOYER_CANISTER_ID);

  const onCreate = useCallback(async () => {
    let principal: Principal | null = null;

    setSpawning(true);
    try {
      const res = await fetch('/union-wallet.wasm');
      const buffer = await res.arrayBuffer();
      const module = [...new Uint8Array(buffer)];

      principal = await canister.spawn({ wasm_module: module });
    } catch (e) {
      console.error(e);
    }
    setSpawning(false);
    onApproved(principal);
  }, [setSpawning, onApproved]);

  return (
    <Container>
      <Title variant='h3'>Заявка на создание юнион-кошелька</Title>
      <Item variant='p2'>К оплате: 0.2 ICP</Item>
      <Item variant='p2'>
        Статус: <span>Не оплачено</span>
      </Item>
      <Item variant='p2'>Идентификатор: -</Item>
      <Info variant='p2'>
        Для оплаты перейдите в nns.ic0.app и переведите 0.2 ICP на аккаунт
        <br />-
      </Info>
      <Button disabled={spawning} onClick={onCreate}>
        Подтвердить оплату и создать кошелек
      </Button>
    </Container>
  );
};
