import React, { useCallback, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import {
  PageWrapper,
  TextField as TF,
  Text,
  Button as B,
  ImageFile as IF,
} from '@union/components';
import { useForm, Controller } from 'react-hook-form';
import { UpdateSettingsRequest } from 'union-ts';
import { useNavigate } from 'react-router-dom';
import { useUnion } from 'services';
import { UnionSubmitButton } from '../../../components/UnionSubmit';
import { useCurrentUnion } from '../context';

const ImageFile = styled(IF)``;
const Button = styled(B)``;
const TextField = styled(TF)``;

const Container = styled(PageWrapper)`
  & > ${TextField} {
    margin-bottom: 24px;
  }

  ${ImageFile} {
    height: 100px;
    width: 100px;
  }

  ${Button} {
    align-self: flex-start;
  }
`;

export interface SetUpdateInfoFormData {
  name: string;
  description: string;
}

export const UpdateInfoForm = (p: Omit<UpdateInfoFormComponentProps, 'info'>) => {
  const { principal } = useCurrentUnion();
  const { canister, data } = useUnion(principal);

  useEffect(() => {
    canister.get_settings();
  }, []);

  const info: SetUpdateInfoFormData | null = useMemo(() => {
    const settings = data.get_settings?.settings;

    if (!settings) {
      return null;
    }

    return {
      name: settings.name,
      description: settings.description,
    };
  }, [data.get_settings?.settings]);

  if (!info) {
    return <Text>fetching...</Text>;
  }

  return <UpdateInfoFormComponent info={info} />;
};

export interface UpdateInfoFormComponentProps {
  className?: string;
  style?: React.CSSProperties;
  info?: SetUpdateInfoFormData | null;
}

export const UpdateInfoFormComponent = ({ info, ...p }: UpdateInfoFormComponentProps) => {
  const {
    control,
    getValues,
    setValue,
    formState: { isValid },
  } = useForm<SetUpdateInfoFormData>({
    defaultValues: { ...info },
    mode: 'onChange',
  });
  const nav = useNavigate();
  const { principal } = useCurrentUnion();

  const getUpdatePayload = useCallback((): UpdateSettingsRequest => {
    const { name, description } = getValues();

    return {
      new_name: !info?.name || info?.name !== name ? [name] : [],
      new_description: !info?.description || info?.description !== description ? [description] : [],
    };
  }, [getValues, info]);

  return (
    <Container {...p} title='Install wasm to canister' withBack>
      <Controller
        name='name'
        control={control}
        rules={{
          required: 'Required field',
        }}
        render={({ field, fieldState: { error } }) => (
          <TextField {...field} helperText={error?.message} label='Name' />
        )}
      />
      <Controller
        name='description'
        control={control}
        rules={{
          required: 'Required field',
        }}
        render={({ field, fieldState: { error } }) => (
          <TextField {...field} helperText={error?.message} label='Description' />
        )}
      />
      <UnionSubmitButton
        unionId={principal}
        canisterId={principal}
        methodName='update_settings'
        getPayload={() => [getUpdatePayload()]}
        onExecuted={() => nav(-1)}
        disabled={!isValid}
      >
        Update
      </UnionSubmitButton>
    </Container>
  );
};
