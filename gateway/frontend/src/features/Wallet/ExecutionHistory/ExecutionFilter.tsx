import { Row, TextField } from '@union/components';
import React, { useCallback } from 'react';
import { Controller, useForm } from 'react-hook-form';
import styled from 'styled-components';
import { checkPrincipal } from 'toolkit';
import { ProgramExecutionFilter } from 'union-ts';

const Container = styled(Row)`
  & > * {
    flex-grow: 1;
  }
`;

export const defaultFilter: ProgramExecutionFilter = {
  endpoint: [],
  from_timestamp: [],
  to_timestamp: [],
};

export interface ExecutionFilterProps {
  className?: string;
  style?: React.CSSProperties;
  filter: ProgramExecutionFilter;
  onChange(f: ProgramExecutionFilter): void;
}

export const ExecutionFilter = styled(({ filter, onChange, ...p }: ExecutionFilterProps) => {
  const { control, getValues } = useForm<ProgramExecutionFilter>({
    defaultValues: defaultFilter,
    mode: 'onChange',
  });

  const handleSubmit = useCallback(() => {
    const { endpoint, from_timestamp, to_timestamp } = getValues() as ProgramExecutionFilter;

    const newFilter = { ...defaultFilter };

    const canister_id = checkPrincipal(endpoint[0]?.canister_id);

    if (endpoint[0] && canister_id && endpoint[0].method_name) {
      newFilter.endpoint = [{ canister_id, method_name: endpoint[0].method_name }];
    }
    if (typeof from_timestamp[0] == 'bigint') {
      newFilter.from_timestamp = from_timestamp;
    }
    if (typeof to_timestamp[0] == 'bigint') {
      newFilter.to_timestamp = to_timestamp;
    }

    onChange(newFilter);
  }, [onChange, getValues]);

  return (
    <Container {...p}>
      <Controller
        name='endpoint.0.canister_id'
        control={control}
        rules={{
          validate: {
            isPrincipal: (v) => !v || !!checkPrincipal(v) || 'Wrong principal',
          },
        }}
        render={({ field: { value, ...field }, fieldState: { error } }) => (
          <TextField
            label='Canister Id'
            onChange={(e) => field.onChange(e.target.value)}
            defaultValue={filter.endpoint[0]?.canister_id.toString()}
            onKeyDown={(e) => e.key == 'Enter' && handleSubmit()}
            helperText={error?.message}
            placeholder='Type and press Enter'
          />
        )}
      />
      <Controller
        name='endpoint.0.method_name'
        control={control}
        render={({ field: { value, ...field }, fieldState: { error } }) => (
          <TextField
            label='Method name'
            onChange={field.onChange}
            value={value}
            defaultValue={filter.endpoint[0]?.method_name}
            onKeyDown={(e) => e.key == 'Enter' && handleSubmit()}
            helperText={error?.message}
            placeholder='Type and press Enter'
          />
        )}
      />
      <Controller
        name='from_timestamp.0'
        control={control}
        render={({ field: { value, ...field }, fieldState: { error } }) => (
          <TextField
            label='From'
            onChange={(e) => {
              const time = new Date(e.target.value).getTime();

              field.onChange(!isNaN(time) ? BigInt(time * 10 ** 6) : null);
            }}
            type='datetime-local'
            defaultValue={bigintToTimestamp(filter.from_timestamp[0])}
            onKeyDown={(e) => e.key == 'Enter' && handleSubmit()}
            helperText={error?.message}
          />
        )}
      />
      <Controller
        name='to_timestamp.0'
        control={control}
        render={({ field: { value, ...field }, fieldState: { error } }) => (
          <TextField
            label='To'
            onChange={(e) => {
              const time = new Date(e.target.value).getTime();

              field.onChange(!isNaN(time) ? BigInt(time * 10 ** 6) : null);
            }}
            type='datetime-local'
            defaultValue={bigintToTimestamp(filter.from_timestamp[0])}
            onKeyDown={(e) => e.key == 'Enter' && handleSubmit()}
            helperText={error?.message}
          />
        )}
      />
    </Container>
  );
})``;

const bigintToTimestamp = (v: bigint | void) =>
  (typeof v !== 'undefined' ? Math.ceil(Number(v) / 10 ** 6) : 0);
