import React from 'react';
import styled from 'styled-components';
import { useForm, Controller } from 'react-hook-form';
import {
  PageWrapper,
  Text,
  Select as LS,
  TextField as TF,
  MultiSelectSkeleton as MS,
  AccourdeonBordered as Acc,
  Column,
} from '@union/components';
import { checkPrincipal } from 'toolkit';
import { useNavigate } from 'react-router-dom';
import { UnionSubmitButton } from '../../../../components/UnionSubmit';
import { useCurrentUnion } from '../../context';
import { CanisterMethods as CM } from './CanisterMethods';
import { FormData } from './types';
import { useEdit } from './useEdit';
import { useCreate } from './useCreate';

const Accordeon = styled(Acc)``;
const AccordeonTitle = styled(Text)``;
const Separator = styled(Text)`
  color: ${({ theme }) => theme.colors.grey};
`;
const CanisterMethods = styled(CM)``;
const MultiSelectSkeleton = styled(MS)``;
const Select = styled(LS)``;
const TextField = styled(TF)``;
const MultiSelectTextField = styled(TF)``;

const MultiSelectFields = styled(Column)``;

const Container = styled(PageWrapper)`
  ${AccordeonTitle}, ${CanisterMethods} {
    padding: 8px;
  }

  ${TextField}, ${Select}, ${MultiSelectSkeleton} {
    margin-bottom: 24px;
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
    formState: { isValid, errors },
  } = useForm<FormData>({
    defaultValues: {
      name: '',
      description: '',
      targets: [],
    },
    mode: 'onChange',
  });
  const nav = useNavigate();
  const { principal } = useCurrentUnion();
  const { getCreatePermissionPayload } = useCreate({ getValues });
  const { getUpdatePermissionPayload, fallback } = useEdit({ setValue, getValues });

  if (!create && fallback) {
    return fallback;
  }

  return (
    <Container title={create ? 'Create new permission' : 'Edit permission'} withBack>
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
        render={({ field, fieldState: { error } }) => (
          <MultiSelectSkeleton
            {...field}
            helperText={error?.message}
            label='Targets'
            renderElement={(v) =>
              (!v.canisterId
                ? 'Empty program'
                : `${v.canisterId || '*'}:${v.methodName || '*'}${v.methodName ? '()' : ''}`)
            }
          >
            {(
              refs, // FIXME separate component
            ) => (
              <MultiSelectFields>
                <Accordeon
                  title={
                    <AccordeonTitle variant='p3'>
                      Select from union{' '}
                      <Text variant='p3' weight='medium'>
                        {principal.toString()}
                      </Text>{' '}
                      candid
                    </AccordeonTitle>
                  }
                >
                  <Controller
                    name='targets'
                    control={control}
                    rules={{
                      validate: {
                        isPrincipal: (value) =>
                          !value.length ||
                          !value.find(
                            (v) =>
                              v.canisterId.trim() && checkPrincipal(v.canisterId.trim()) == null,
                          ) ||
                          'Incorrect principal',
                      },
                    }}
                    render={({ field }) => <CanisterMethods {...field} />}
                  />
                </Accordeon>
                <Separator variant='p2'>or fill another canister data (empty allowed)</Separator>
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
      {create ? (
        <UnionSubmitButton
          unionId={principal}
          canisterId={principal}
          methodName='create_permission'
          getPayload={() => [getCreatePermissionPayload()]}
          onExecuted={() => nav(-1)}
          disabled={!isValid}
        >
          Create permission
        </UnionSubmitButton>
      ) : (
        <UnionSubmitButton
          unionId={principal}
          canisterId={principal}
          methodName='update_permission'
          getPayload={() => [getUpdatePermissionPayload()]}
          onExecuted={() => nav(-1)}
          disabled={!isValid}
        >
          Update permission
        </UnionSubmitButton>
      )}
    </Container>
  );
};
