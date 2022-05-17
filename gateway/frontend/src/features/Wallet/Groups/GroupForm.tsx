import React, { useMemo } from 'react';
import styled from 'styled-components';
import { PageWrapper, TextField as TF, Checkbox } from '@union/components';
import { useForm, Controller } from 'react-hook-form';
import { CreateGroupRequest, _SERVICE } from 'union-ts';
import { useNavigate } from 'react-router-dom';
import { UnionSubmitButton } from '../../../components/UnionSubmit';
import { useCurrentUnion } from '../context';

const TextField = styled(TF)``;

const Container = styled(PageWrapper)`
  & > ${TextField}, & > ${Checkbox} {
    margin-bottom: 24px;
  }
`;

export interface GroupFormFormData extends CreateGroupRequest {}

export interface GroupFormProps {
  className?: string;
  style?: React.CSSProperties;
}

export const GroupForm = ({ ...p }: GroupFormProps) => {
  const data: GroupFormFormData = useMemo(
    () => ({
      name: '',
      description: '',
      transferable: false,
      private: false,
    }),
    [],
  );

  return <GroupFormComponent {...p} data={data} />;
};

export const GroupFormComponent = ({
  data,
  ...p
}: GroupFormProps & {
  data: GroupFormFormData;
}) => {
  const { principal } = useCurrentUnion();
  const nav = useNavigate();
  const {
    control,
    getValues,
    formState: { isValid },
  } = useForm<GroupFormFormData>({
    defaultValues: { ...data },
    mode: 'onChange',
  });

  return (
    <Container {...p} title='Create group' withBack>
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
      <UnionSubmitButton
        canisterId={principal}
        methodName='create_group'
        getPayload={() => [getValues()]}
        onExecuted={() => nav(-1)}
        disabled={!isValid}
      >
        Create group
      </UnionSubmitButton>
    </Container>
  );
};
