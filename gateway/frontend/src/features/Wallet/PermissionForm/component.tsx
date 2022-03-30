import React from 'react';
import styled from 'styled-components';
import { useForm, Controller } from 'react-hook-form';
import {
  Text,
  Select as LS,
  Option,
  TextField as TF,
  Button as B,
  MultiSelectSkeleton as MS,
} from 'components';
import { checkPrincipal } from 'toolkit';
import { useSubmit } from './useSubmit';
import { FormData } from './types';

const MultiSelectSkeleton = styled(MS)``;
const Select = styled(LS)``;
const Button = styled(B)``;
const Title = styled(Text)``;
const TextField = styled(TF)``;
const MultiSelectTextField = styled(TF)``;

const MultiSelectFields = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  & > *:not(:last-child) {
    margin-bottom: 8px;
  }
`;
const Container = styled.div`
  display: flex;
  flex-direction: column;

  ${Title} {
    margin-bottom: 64px;
  }

  ${TextField}, ${Select}, ${MultiSelectSkeleton} {
    margin-bottom: 24px;
  }

  ${Button} {
    margin-top: 32px;
    align-self: center;
  }
`;

export interface PermissionFormProps {
  create?: boolean;
}

export const PermissionForm = ({ create }: PermissionFormProps) => {
  const {
    control,
    setValue,
    getValues,
    formState: { isValid },
  } = useForm<FormData>({
    defaultValues: {
      name: '',
      scope: 'Blacklist',
      targets: [],
    },
    mode: 'onTouched',
  });
  const { fallback, submitting, onSubmit } = useSubmit({ create, setValue, getValues });
  const submit = onSubmit;

  if (fallback) {
    return fallback;
  }

  return (
    <Container>
      <Title variant='h2'>{create ? 'Создание новой пермиссии' : 'Редактирование пермиссии'}</Title>
      <Controller
        name='name'
        control={control}
        rules={{ required: 'Обязательное поле' }}
        render={({ field, fieldState: { error } }) => (
          <TextField {...field} helperText={error?.message} label='Наименование пермиссии' />
        )}
      />
      <Controller
        name='scope'
        control={control}
        rules={{ required: 'Обязательное поле' }}
        render={({ field, fieldState: { error } }) => (
          <Select {...field} helperText={error?.message} title='Тип пермиссии'>
            <Option value='Blacklist'>Blacklist</Option>
            <Option value='Whitelist'>Whitelist</Option>
          </Select>
        )}
      />
      <Controller
        name='targets'
        control={control}
        rules={{
          required: 'Обязательное поле',
          validate: {
            isPrincipal: (value) =>
              !value.find(
                (v) =>
                  (v.canisterId.trim() && checkPrincipal(v.canisterId.trim()) == null) ||
                  'Некорректный принципал',
              ),
          },
        }}
        render={({ field, fieldState: { error } }) => (
          <MultiSelectSkeleton
            {...field}
            helperText={error?.message}
            label='Целевой канистер'
            renderElement={(v) =>
              `${v.canisterId || '*'}:${v.methodName || '*'}${v.methodName ? '()' : ''}`
            }
          >
            {(
              refs, // FIXME это точно нужно будет нормально переделать на отдельный компонент
            ) => (
              <MultiSelectFields>
                <MultiSelectTextField
                  ref={(r) => r && (refs.current[0] = r)}
                  id='canisterId'
                  label='Принципал канистера'
                />
                <MultiSelectTextField
                  ref={(r) => r && (refs.current[1] = r)}
                  id='methodName'
                  label='Метод'
                />
              </MultiSelectFields>
            )}
          </MultiSelectSkeleton>
        )}
      />
      <Button type='submit' disabled={!isValid || submitting} onClick={submit}>
        {create ? 'Создать' : 'Обновить'}
      </Button>
    </Container>
  );
};
