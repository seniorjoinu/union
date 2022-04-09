import React from 'react';
import styled from 'styled-components';
import { useForm, Controller } from 'react-hook-form';
import {
  PageWrapper,
  Select as S,
  Option,
  TextField as TF,
  Button as B,
  ListSelect as LS,
} from 'components';
import { useRoles } from '../useRoles';
import { parseRole } from '../utils';
import { useSubmit } from './useSubmit';
import { FormData } from './types';

const ListSelect = styled(LS)``;
const Select = styled(S)``;
const Button = styled(B)``;
const TextField = styled(TF)``;
const Thresholds = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;

  & > *:not(:last-child) {
    margin-right: 16px;
  }
`;

const Container = styled(PageWrapper)`
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
  const { fallback, submitting, onSubmit } = useSubmit({ create, setValue, getValues });
  const { roles } = useRoles();

  const submit = onSubmit;

  if (fallback) {
    return fallback;
  }

  return (
    <Container title={create ? 'Create new role' : 'Edit role'}>
      <Controller
        name='name'
        control={control}
        rules={{ required: 'Required field' }}
        render={({ field, fieldState: { error } }) => (
          <TextField {...field} helperText={error?.message} label='Name' />
        )}
      />
      <Controller
        name='description'
        control={control}
        rules={{ required: 'Required field' }}
        render={({ field, fieldState: { error } }) => (
          <TextField {...field} helperText={error?.message} label='Description' />
        )}
      />
      <Thresholds>
        <Controller
          name='threshold'
          control={control}
          rules={{
            required: 'Required field',
            min: 0,
            validate: {
              threshold: (value) => {
                const { type } = getValues();

                if (type != 'QuantityOf') {
                  return (value >= 0 && value <= 1) || 'Incorrect value';
                }

                if (value < 0) {
                  return 'Value must be greather than 0';
                }

                return true;
              },
            },
          }}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              helperText={error?.message}
              label='Threshold schema'
              type='number'
            />
          )}
        />
        <Controller
          name='type'
          control={control}
          rules={{ required: 'Required field' }}
          render={({ field, fieldState: { error } }) => (
            <Select {...field} helperText={error?.message} title='Threshold schema'>
              <Option value='FractionOf'>FractionOf</Option>
              <Option value='QuantityOf'>QuantityOf</Option>
            </Select>
          )}
        />
      </Thresholds>
      <Controller
        name='owners'
        control={control}
        rules={{
          required: 'Required field',
        }}
        render={({ field, fieldState: { error } }) => (
          <ListSelect
            {...field}
            helperText={error?.message}
            label='Role owners'
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
        {create ? 'Create' : 'Update'}
      </Button>
    </Container>
  );
};
