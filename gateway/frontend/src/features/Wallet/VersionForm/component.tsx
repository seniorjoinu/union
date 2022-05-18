import React from 'react';
import styled from 'styled-components';
import {
  PageWrapper,
  TextField as TF,
  MaskedTextField as MTF,
  Text,
  Button as B,
} from '@union/components';
import { useForm, Controller } from 'react-hook-form';
import { useCreateVersion, FormData } from '../useVersion';

const Button = styled(B)``;
const TextField = styled(TF)``;
const MaskedTextField = styled(MTF)``;

const Container = styled(PageWrapper)`
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
    mode: 'onChange',
  });
  const { create } = useCreateVersion({ getValues });

  return (
    <Container {...p} title='Create version'>
      <Controller
        name='version'
        control={control}
        rules={{
          required: 'Required field',
          validate: {
            isFilled: (value) => !!value.replaceAll('_', '').match(/\d.\d+.\d+/) || 'Fill version',
          },
        }}
        render={({ field, fieldState: { error } }) => (
          <MaskedTextField
            {...field}
            helperText={error?.message}
            label='Version name'
            mask='9.99.99'
          />
        )}
      />
      <Controller
        name='description'
        control={control}
        rules={{
          required: 'Required field',
          validate: {
            length: (value) => value.length > 10 || 'Description length must be greather than 10',
          },
        }}
        render={({ field, fieldState: { error } }) => (
          <TextField {...field} helperText={error?.message} label='Description' />
        )}
      />
      <Controller
        name='file'
        control={control}
        rules={{ required: 'Required field' }}
        render={({ fieldState: { error } }) => (
          <TextField
            type='file'
            accept='.wasm'
            helperText={error?.message}
            label='.wasm file'
            onChange={(e) => {
              const file = e.target.files?.item(0) || null;

              setValue('file', file, { shouldValidate: true });
            }}
          />
        )}
      />
      <Button type='submit' disabled={!isValid} onClick={() => create()}>
        Create
      </Button>
    </Container>
  );
};
