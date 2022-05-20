import React, { useCallback } from 'react';
import styled from 'styled-components';
import { Controller, useForm } from 'react-hook-form';
import { TextField as TF, Text, SubmitButton as B, Checkbox } from '@union/components';
import { checkPrincipal } from 'toolkit';

const Button = styled(B)``;
const TextField = styled(TF)``;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;

  ${TextField} {
    flex-grow: 1;
    margin-right: 8px;
  }
`;

export interface BatchSenderProps {
  className?: string;
  style?: React.CSSProperties;
  batchIds: bigint[];
}

interface FormData {
  canisterId: string;
  removeBatches: boolean;
}

export const BatchSender = ({ batchIds, ...p }: BatchSenderProps) => {
  const {
    control,
    getValues,
    setValue,
    formState: { isValid },
  } = useForm<FormData>({
    defaultValues: {
      canisterId: '',
      removeBatches: true,
    },
    mode: 'onChange',
  });

  const send = (...args: any[]) => {
    throw new Error('Not implemented');
  };
  const handleSend = useCallback(async () => {
    const { canisterId: rawCanisterId, removeBatches } = getValues();

    const canisterId = rawCanisterId?.trim();

    if (!canisterId || !batchIds.length) {
      return;
    }

    await send(batchIds, canisterId, removeBatches);
  }, [send, getValues, setValue, batchIds]);

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
          <TextField {...field} helperText={error?.message} label='Send batches to canister id' />
        )}
      />
      <Controller
        name='removeBatches'
        control={control}
        render={({ field }) => (
          <Checkbox checked={field.value} onChange={field.onChange}>
            Remove batches?
          </Checkbox>
        )}
      />
      <Button type='submit' disabled={!isValid || !batchIds.length} onClick={handleSend}>
        Send batches ({batchIds.length})
      </Button>
    </Container>
  );
};
