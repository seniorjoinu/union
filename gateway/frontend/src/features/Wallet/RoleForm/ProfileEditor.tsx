import React from 'react';
import styled from 'styled-components';
import { useForm, Controller } from 'react-hook-form';
import { PageWrapper, TextField as TF, Button as B } from '@union/components';
import { ProfileFormData, useEditProfile } from './useEditProfile';

const Button = styled(B)``;
const TextField = styled(TF)``;

const Container = styled(PageWrapper)`
  ${TextField} {
    margin-bottom: 24px;
  }

  ${Button} {
    margin-top: 32px;
    align-self: center;
  }
`;

export interface ProfileEditorProps {
  roleId: number;
  data: ProfileFormData;
}

export const ProfileEditor = ({ roleId, data }: ProfileEditorProps) => {
  const {
    control,
    getValues,
    formState: { isValid },
  } = useForm<ProfileFormData>({
    defaultValues: { ...data },
    mode: 'onTouched',
  });
  const { editProfile } = useEditProfile();

  return (
    <Container title='Edit profile'>
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
      <Button
        type='submit'
        disabled={!isValid}
        onClick={() => editProfile(roleId, getValues(), data)}
      >
        Save
      </Button>
    </Container>
  );
};
