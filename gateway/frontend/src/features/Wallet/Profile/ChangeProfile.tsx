import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { PageWrapper, TextField as TF, SubmitButton as SB } from '@union/components';
import { useForm, Controller } from 'react-hook-form';
import { useUnion } from 'services';
import { useNavigate } from 'react-router-dom';
import { useCurrentUnion } from '../context';

const TextField = styled(TF)``;
const Button = styled(SB)``;

const Container = styled(PageWrapper)`
  & > ${TextField} {
    margin-bottom: 24px;
  }

  Button {
    align-self: flex-start;
  }
`;

export interface ChangeProfileFormData {
  name: string;
  description: string;
}

export interface ChangeProfileProps {
  className?: string;
  style?: React.CSSProperties;
}

export const ChangeProfile = ({ ...p }: ChangeProfileProps) => {
  const { profile } = useCurrentUnion();

  const data: ChangeProfileFormData = useMemo(
    () => ({
      name: profile?.name || '',
      description: profile?.description || '',
    }),
    [profile],
  );

  if (!profile) {
    return null;
  }

  return <ChangeProfileComponent {...p} data={data} />;
};

export const ChangeProfileComponent = ({
  data,
  ...p
}: ChangeProfileProps & {
  data: ChangeProfileFormData;
}) => {
  const nav = useNavigate();
  const { principal } = useCurrentUnion();
  const union = useUnion(principal);
  const {
    control,
    getValues,
    formState: { isValid },
  } = useForm<ChangeProfileFormData>({
    defaultValues: { ...data },
    mode: 'onTouched',
  });

  const submit = useCallback(
    async (data: ChangeProfileFormData) => {
      // TODO check changing
      await union.canister.update_my_profile({
        new_name: [data.name],
        new_description: [data.description],
      });
      nav(-1);
    },
    [union, nav],
  );

  const fetching = !!union.fetching.update_my_profile;

  return (
    <Container {...p} title='Form' withBack>
      <Controller
        name='name'
        control={control}
        rules={{ required: 'Required field' }}
        render={({ field, fieldState: { error } }) => (
          <TextField {...field} helperText={error?.message} disabled={fetching} label='Name' />
        )}
      />
      <Controller
        name='description'
        control={control}
        rules={{ required: 'Required field' }}
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            helperText={error?.message}
            disabled={fetching}
            label='Description'
          />
        )}
      />
      <Button type='submit' disabled={!isValid || fetching} onClick={() => submit(getValues())}>
        Submit
      </Button>
    </Container>
  );
};
