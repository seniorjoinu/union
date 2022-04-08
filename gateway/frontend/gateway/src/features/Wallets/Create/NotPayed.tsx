import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { Principal } from '@dfinity/principal';
import { SubmitButton as B, Text, Select as S, Option } from 'components';
import { useAuth, useDeployer, useGateway } from 'services';
import { useForm, Controller } from 'react-hook-form';

const Select = styled(S)``;
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
  const {
    control,
    getValues,
    setValue,
    formState: { isValid },
  } = useForm<{ version: string }>({
    defaultValues: {
      version: '',
    },
  });
  const { identity } = useAuth();
  const deployer = useDeployer(process.env.UNION_DEPLOYER_CANISTER_ID);
  const { canister } = useGateway(process.env.GATEWAY_CANISTER_ID);

  useEffect(() => {
    deployer.canister.get_binary_versions();
  }, []);

  const onCreate = useCallback(async () => {
    const { version } = getValues();
    const walletCreator = identity?.getPrincipal();

    if (!version || !walletCreator) {
      return;
    }

    let principal: Principal | null = null;

    try {
      const { bill_id } = await canister.spawn_union_wallet({
        version,
        wallet_creator: walletCreator,
      });

      const { canister_id } = await canister.prove_bill_paid({ proof: { bill_id } });

      principal = canister_id;
    } catch (e) {
      console.error(e);
    }
    onApproved(principal);
  }, [onApproved, getValues, identity]);

  const versions = deployer.data.get_binary_versions?.versions || [];

  useEffect(() => {
    const existing = getValues().version;

    if (existing || !versions.length) {
      return;
    }

    setValue('version', versions[0], { shouldValidate: true });
  }, [setValue, getValues, versions]);

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
      <Controller
        name='version'
        control={control}
        rules={{ required: 'Required field' }}
        render={({ field, fieldState: { error } }) => (
          <Select {...field} helperText={error?.message} title='Выберите версию'>
            {versions.map((v) => (
              <Option key={v} value={v}>
                {v}
              </Option>
            ))}
          </Select>
        )}
      />
      <Button disabled={!isValid} onClick={onCreate}>
        Подтвердить оплату и создать кошелек
      </Button>
    </Container>
  );
};
