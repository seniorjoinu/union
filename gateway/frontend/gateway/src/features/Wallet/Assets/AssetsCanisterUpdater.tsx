import React from 'react';
import styled from 'styled-components';
import { TextField as TF, Text, Button as B } from 'components';
import { useForm, Controller } from 'react-hook-form';
import { checkPrincipal } from 'toolkit';
import { useUpdateAssetCanister, UpdateAssetCanisterFormData } from './useSpawnCanister';

const Button = styled(B)``;
const Title = styled(Text)``;
const TextField = styled(TF)``;

const Container = styled.div`
  display: flex;
  flex-direction: column;

  ${Title} {
    margin-bottom: 64px;
  }

  ${TextField} {
    margin-bottom: 24px;
  }

  ${Button} {
    align-self: flex-start;
  }
`;

export interface AssetsCanisterUpdaterProps {
  className?: string;
  style?: React.CSSProperties;
}

export const AssetsCanisterUpdater = ({ ...p }: AssetsCanisterUpdaterProps) => {
  const {
    control,
    getValues,
    setValue,
    formState: { isValid },
  } = useForm<UpdateAssetCanisterFormData>({
    defaultValues: {
      canisterId: '',
      file: null,
    },
    mode: 'onTouched',
  });
  const { updateCanister } = useUpdateAssetCanister({ getValues });

  return (
    <Container {...p}>
      <Controller
        name='canisterId'
        control={control}
        rules={{
          required: 'Required field',
          validate: {
            isPrincipal: (value) => !!checkPrincipal(value.trim()) || 'Incorrect principal',
          },
        }}
        render={({ field, fieldState: { error } }) => (
          <TextField {...field} helperText={error?.message} label='ID канистера' />
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
            label='Файл .wasm'
            onChange={(e) => {
              const file = e.target.files?.item(0) || null;

              setValue('file', file, { shouldValidate: true });
            }}
          />
        )}
      />
      <Button type='submit' disabled={!isValid} onClick={updateCanister}>
        Загрузить
      </Button>
    </Container>
  );
};
