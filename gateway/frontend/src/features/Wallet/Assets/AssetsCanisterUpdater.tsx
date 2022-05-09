import React from 'react';
import styled from 'styled-components';
import { PageWrapper, TextField as TF, Select as S, Option, Button as B } from '@union/components';
import { useForm, Controller } from 'react-hook-form';
import { checkPrincipal } from 'toolkit';
import { useUpdateAssetCanister, UpdateAssetCanisterFormData } from './useSpawnCanister';

const Select = styled(S)``;
const Button = styled(B)``;
const TextField = styled(TF)``;

const Container = styled(PageWrapper)`
  ${TextField}, ${Select} {
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
      mode: 'install',
    },
    mode: 'onTouched',
  });
  const { updateCanister } = useUpdateAssetCanister({ getValues });

  return (
    <Container {...p} title='Install wasm to canister' withBack>
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
          <TextField {...field} helperText={error?.message} label='Canister ID' />
        )}
      />
      <Controller
        name='mode'
        control={control}
        rules={{ required: 'Required field' }}
        render={({ field, fieldState: { error } }) => (
          <Select {...field} helperText={error?.message} title='Mode'>
            <Option value='install'>install</Option>
            <Option value='reinstall'>reinstall</Option>
            <Option value='upgrade'>upgrade</Option>
          </Select>
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
      <Button type='submit' disabled={!isValid} onClick={updateCanister}>
        Install code
      </Button>
    </Container>
  );
};
