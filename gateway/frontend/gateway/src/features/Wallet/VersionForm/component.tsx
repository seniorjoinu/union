import React from 'react';
import styled from 'styled-components';
import { TextField as TF, MaskedTextField as MTF, Text, Button as B } from 'components';
import { useForm, Controller } from 'react-hook-form';
import { useCreateVersion, FormData } from './useCreateVersion';

const Button = styled(B)``;
const Title = styled(Text)``;
const TextField = styled(TF)``;
const MaskedTextField = styled(MTF)``;

const Container = styled.div`
  display: flex;
  flex-direction: column;

  ${Title} {
    margin-bottom: 64px;
  }

  ${TextField}, ${MaskedTextField} {
    margin-bottom: 24px;
  }

  ${Button} {
    margin-top: 32px;
    align-self: center;
  }
`;

export interface VersionFormProps {
  className?: string;
  style?: React.CSSProperties;
}

export const VersionForm = ({ ...p }: VersionFormProps) => {
  const {
    control,
    getValues,
    setValue,
    formState: { isValid },
  } = useForm<FormData>({
    defaultValues: {
      version: '',
      description: '',
      file: null,
    },
    mode: 'onTouched',
  });
  const { create } = useCreateVersion({ getValues });

  return (
    <Container {...p}>
      <Controller
        name='version'
        control={control}
        rules={{
          required: 'Обязательное поле',
          validate: {
            isFilled: (value) =>
              !!value.replaceAll('_', '').match(/\d.\d+.\d+/) || 'Заполните версию',
          },
        }}
        render={({ field, fieldState: { error } }) => (
          <MaskedTextField
            {...field}
            helperText={error?.message}
            label='Наименование версии'
            mask='9.99.99'
          />
        )}
      />
      <Controller
        name='description'
        control={control}
        rules={{
          required: 'Обязательное поле',
          validate: {
            length: (value) => value.length > 10 || 'Описание должно быть длиннее 10 символов',
          },
        }}
        render={({ field, fieldState: { error } }) => (
          <TextField {...field} helperText={error?.message} label='Описание версии' />
        )}
      />
      <Controller
        name='file'
        control={control}
        rules={{ required: 'Обязательное поле' }}
        render={({ fieldState: { error } }) => (
          <TextField
            type='file'
            accept='.wasm'
            helperText={error?.message}
            label='Файл .wasm'
            onChange={(e) => {
              const file = e.target.files?.item(0) || null;

              setValue('file', file, { shouldValidate: true });
            }}
          />
        )}
      />
      <Button type='submit' disabled={!isValid} onClick={create}>
        Создать
      </Button>
    </Container>
  );
};
