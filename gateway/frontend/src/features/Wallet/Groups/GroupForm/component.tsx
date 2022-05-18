import React, { useMemo } from 'react';
import styled from 'styled-components';
import { PageWrapper, TextField as TF, Checkbox } from '@union/components';
import { useForm, Controller } from 'react-hook-form';
import { _SERVICE } from 'union-ts';
import { useNavigate } from 'react-router-dom';
import { UnionSubmitButton } from '../../../../components/UnionSubmit';
import { useCurrentUnion } from '../../context';
import { GroupFormData } from './types';
import { useEdit } from './useEdit';

const TextField = styled(TF)``;

const Container = styled(PageWrapper)`
  & > ${TextField}, & > ${Checkbox} {
    margin-bottom: 24px;
  }
`;

export interface GroupFormProps {
  className?: string;
  style?: React.CSSProperties;
  create?: boolean;
}

export const GroupForm = ({ create, ...p }: GroupFormProps) => {
  const { principal } = useCurrentUnion();
  const nav = useNavigate();
  const {
    control,
    getValues,
    setValue,
    formState: { isValid },
  } = useForm<GroupFormData>({
    defaultValues: { name: '', description: '', transferable: false, private: false },
    mode: 'onChange',
  });
  const { getUpdatePayload, fallback } = useEdit({ getValues, setValue });
  const getCreatePayload = getValues;

  if (!create && fallback) {
    return fallback;
  }

  return (
    <Container {...p} title={create ? 'Create group' : 'Edit group'} withBack>
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
      {create && (
        <>
          <Controller
            name='private'
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Checkbox checked={field.value} onChange={field.onChange}>
                private
              </Checkbox>
            )}
          />
          <Controller
            name='transferable'
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Checkbox checked={field.value} onChange={field.onChange}>
                transferable
              </Checkbox>
            )}
          />
        </>
      )}
      {create ? (
        <UnionSubmitButton
          unionId={principal}
          canisterId={principal}
          methodName='create_group'
          getPayload={() => [getCreatePayload()]}
          onExecuted={() => nav(-1)}
          disabled={!isValid}
        >
          Create group
        </UnionSubmitButton>
      ) : (
        <UnionSubmitButton
          unionId={principal}
          canisterId={principal}
          methodName='update_group'
          getPayload={() => [getUpdatePayload()]}
          onExecuted={() => nav(-1)}
          disabled={!isValid}
        >
          Update group
        </UnionSubmitButton>
      )}
    </Container>
  );
};
