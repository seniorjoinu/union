import React from 'react';
import styled from 'styled-components';
import { useForm, Controller } from 'react-hook-form';
import {
  PageWrapper,
  Text,
  Select as LS,
  Option,
  TextField as TF,
  Button as B,
  MultiSelectSkeleton as MS,
  Accordeon as Acc,
} from '@union/components';
import { checkPrincipal } from 'toolkit';
import { CanisterMethods as CM } from './CanisterMethods';
import { useSubmit } from './useSubmit';
import { FormData } from './types';

const Accordeon = styled(Acc)``;
const AccordeonTitle = styled(Text)``;
const CanisterMethods = styled(CM)``;
const MultiSelectSkeleton = styled(MS)``;
const Select = styled(LS)``;
const Button = styled(B)``;
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

const Container = styled(PageWrapper)`
  ${AccordeonTitle} {
    padding: 8px 16px;
  }

  ${CanisterMethods} {
    padding: 16px;
  }

  ${TextField}, ${Select}, ${MultiSelectSkeleton}, ${Accordeon} {
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
    <Container title={create ? 'Create new permission' : 'Edit permission'}>
      <Controller
        name='name'
        control={control}
        rules={{ required: 'Required field' }}
        render={({ field, fieldState: { error } }) => (
          <TextField {...field} helperText={error?.message} label='Name' />
        )}
      />
      <Controller
        name='scope'
        control={control}
        rules={{ required: 'Required field' }}
        render={({ field, fieldState: { error } }) => (
          <Select {...field} helperText={error?.message} title='Permission type'>
            <Option value='Blacklist'>Blacklist</Option>
            <Option value='Whitelist'>Whitelist</Option>
          </Select>
        )}
      />
      <Accordeon title={<AccordeonTitle variant='p1'>Candid of wallet</AccordeonTitle>}>
        <Controller
          name='targets'
          control={control}
          rules={{
            validate: {
              isPrincipal: (value) =>
                !value.length ||
                !value.find(
                  (v) => v.canisterId.trim() && checkPrincipal(v.canisterId.trim()) == null,
                ) ||
                'Incorrect principal',
            },
          }}
          render={({ field }) => <CanisterMethods {...field} />}
        />
      </Accordeon>
      <Controller
        name='targets'
        control={control}
        rules={{
          // required: 'Required field',
          validate: {
            isPrincipal: (value) =>
              !value.length ||
              !value.find(
                (v) => v.canisterId.trim() && checkPrincipal(v.canisterId.trim()) == null,
              ) ||
              'Incorrect principal',
          },
        }}
        render={({ field, fieldState: { error } }) => (
          <MultiSelectSkeleton
            {...field}
            helperText={error?.message}
            label='Target canister'
            renderElement={(v) =>
              (!v.canisterId && !v.methodName
                ? 'Empty program'
                : `${v.canisterId || '*'}:${v.methodName || '*'}${v.methodName ? '()' : ''}`)
            }
          >
            {(
              refs, // FIXME это точно нужно будет нормально переделать на отдельный компонент
            ) => (
              <MultiSelectFields>
                <MultiSelectTextField
                  ref={(r) => r && (refs.current[0] = r)}
                  id='canisterId'
                  label='Canister ID'
                />
                <MultiSelectTextField
                  ref={(r) => r && (refs.current[1] = r)}
                  id='methodName'
                  label='Method name'
                />
              </MultiSelectFields>
            )}
          </MultiSelectSkeleton>
        )}
      />
      <Button type='submit' disabled={!isValid || submitting} onClick={submit}>
        {create ? 'Create' : 'Update'}
      </Button>
    </Container>
  );
};
