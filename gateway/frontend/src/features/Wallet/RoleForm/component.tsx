import React, { useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import {
  Text,
  Select as S,
  Option,
  TextField as TF,
  Button as B,
  ListSelect as LS,
} from 'components';
import { useRoles } from '../Participants';
import { parseRole } from '../utils';
import { useSubmit } from './useSubmit';
import { FormData } from './types';

const ListSelect = styled(LS)``;
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

  ${TextField}, ${Select}, ${ListSelect} {
    margin-bottom: 24px;
  }

  ${Button} {
    margin-top: 32px;
    align-self: center;
  }
`;

export interface RoleFormProps {
  create?: boolean;
}

export const RoleForm = ({ create }: RoleFormProps) => {
  const {
    control,
    setValue,
    getValues,
    formState: { isValid },
  } = useForm<FormData>({
    defaultValues: {
      name: '',
      description: '',
      threshold: 1,
      type: 'QuantityOf',
      owners: [],
    },
    mode: 'onTouched',
  });
  const nav = useNavigate();
  const { fallback, submitting, onSubmit } = useSubmit({ create, setValue, getValues });
  const { roles } = useRoles();

  const submit = useCallback(() => {
    onSubmit().then(() => nav(-1));
  }, [onSubmit, nav]);

  if (fallback) {
    return fallback;
  }

  return (
    <Container>
      <Title variant='h2'>{create ? 'Создание новой роли' : 'Редактирование роли'}</Title>
      <Controller
        name='name'
        control={control}
        rules={{ required: 'Обязательное поле' }}
        render={({ field }) => <TextField {...field} label='Наименование роли' />}
      />
      <Controller
        name='description'
        control={control}
        rules={{ required: 'Обязательное поле' }}
        render={({ field }) => <TextField {...field} label='Описание роли' />}
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
        }}
        render={({ field }) => (
          <ListSelect
            {...field}
            label='Обладатели роли'
            from={roles.map((r) => {
              const parsed = parseRole(r.role_type);

              return {
                id: r.id.toString(),
                content: `${r.id} ${parsed.title} ${parsed.principal}`.trim(),
              };
            })}
          />
        )}
      />
      <Button type='submit' disabled={!isValid || submitting} onClick={submit}>
        {create ? 'Создать' : 'Обновить'}
      </Button>
    </Container>
  );
};