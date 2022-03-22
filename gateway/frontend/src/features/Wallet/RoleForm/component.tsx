import React from 'react';
import styled from 'styled-components';
import { useForm, Controller } from 'react-hook-form';
import {
  Text,
  Select as S,
  Option,
  TextField as TF,
  Button as B,
  MultiSelect as MS,
} from 'components';
import { checkPrincipal } from 'toolkit';
import { useEdit } from './useEdit';

const MultiSelect = styled(MS)``;
const Select = styled(S)``;
const Button = styled(B)``;
const Title = styled(Text)``;
const TextField = styled(TF)``;
const Thresholds = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;

  & > *:not(:last-child) {
    margin-right: 16px;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;

  ${Title} {
    margin-bottom: 64px;
  }

  ${TextField}, ${Select} {
    margin-bottom: 24px;
  }

  ${Button} {
    margin-top: 32px;
    align-self: center;
  }
`;

interface FormData {
  name: string;
  threshold: number;
  type: 'FractionOf' | 'QuantityOf';
  owners: string[];
}

export interface RoleFormProps {
  create?: boolean;
}

export const RoleForm = ({ create }: RoleFormProps) => {
  const {
    control,
    getValues,
    setValue,
    formState: { isValid },
  } = useForm<FormData>({
    defaultValues: { name: '', threshold: 1, type: 'QuantityOf', owners: [] },
    mode: 'onTouched',
  });
  const { fallback } = useEdit({ create, setValue });

  if (fallback) {
    return fallback;
  }

  console.log('!!!', isValid, getValues());

  return (
    <Container>
      <Title variant='h2'>{create ? 'Создание новой роли' : 'Редактирование роли'}</Title>
      <Controller
        name='name'
        control={control}
        rules={{ required: 'Обязательное поле' }}
        render={({ field }) => <TextField {...field} label='Наименование роли' />}
      />
      <Thresholds>
        <Controller
          name='threshold'
          control={control}
          rules={{ required: 'Обязательное поле', min: 0, max: 100 }}
          render={({ field }) => <TextField {...field} label='Пороговая схема' type='number' />}
        />
        <Controller
          name='type'
          control={control}
          rules={{ required: 'Обязательное поле' }}
          render={({ field }) => (
            <Select {...field} title='Пороговая схема'>
              <Option value='FractionOf'>Проценты</Option>
              <Option value='QuantityOf'>Доли</Option>
            </Select>
          )}
        />
      </Thresholds>
      <Controller
        name='owners'
        control={control}
        rules={{
          required: 'Обязательное поле',
          validate: {
            isPrincipal: (value) =>
              value.reduce((acc, next) => acc && checkPrincipal(next) !== null, true as boolean),
          },
        }}
        render={({ field }) => <MultiSelect {...field} label='Обладатели роли' />}
      />
      <Button type='submit' disabled={!isValid}>
        {create ? 'Создать' : 'Обновить'}
      </Button>
    </Container>
  );
};
