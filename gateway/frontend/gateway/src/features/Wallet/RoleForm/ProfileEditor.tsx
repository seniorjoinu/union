import React from 'react';
import styled from 'styled-components';
import { useForm, Controller } from 'react-hook-form';
import { Text, TextField as TF, Button as B } from 'components';
import { ProfileFormData, useEditProfile } from './useEditProfile';

const Button = styled(B)``;
const Title = styled(Text)``;
const TextField = styled(TF)``;

const Container = styled.div`
  display: flex;
  flex-direction: column;

  ${Title} {
    margin-bottom: 64px;
  }

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
    <Container>
      <Title variant='h2'>Редактирование профиля</Title>
      <Controller
        name='name'
        control={control}
        rules={{ required: 'Required field' }}
        render={({ field, fieldState: { error } }) => (
          <TextField {...field} helperText={error?.message} label='Наименование профиля' />
        )}
      />
      <Controller
        name='description'
        control={control}
        rules={{ required: 'Required field' }}
        render={({ field, fieldState: { error } }) => (
          <TextField {...field} helperText={error?.message} label='Описание профиля' />
        )}
      />
      <Button
        type='submit'
        disabled={!isValid}
        onClick={() => editProfile(roleId, getValues(), data)}
      >
        Сохранить
      </Button>
    </Container>
  );
};
