import React, { useMemo } from 'react';
import styled from 'styled-components';
import {
  PageWrapper,
  TextField as TF,
  Text,
  Button as B,
  ImageFile as IF,
} from '@union/components';
import { useForm, Controller } from 'react-hook-form';
import { useSetInfo, useGetSettings, SetInfoFormData } from './useUnionInfo';

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

export const InfoForm = (p: Omit<InfoFormComponentProps, 'info'>) => {
  const { data } = useGetSettings();

  const info: SetInfoFormData | null = useMemo(() => {
    if (!data) {
      return null;
    }

    return {
      name: data.name,
      description: data.description,
    };
  }, [data]);

  if (!info) {
    return <Text>fetching...</Text>;
  }

  return <InfoFormComponent info={info} />;
};

export interface InfoFormComponentProps {
  className?: string;
  style?: React.CSSProperties;
  info?: SetInfoFormData | null;
}

export const InfoFormComponent = ({ info, ...p }: InfoFormComponentProps) => {
  const {
    control,
    getValues,
    setValue,
    formState: { isValid },
  } = useForm<SetInfoFormData>({
    defaultValues: { ...info },
    mode: 'onTouched',
  });
  const { setInfo } = useSetInfo({ getValues });

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
      <Button type='submit' disabled={!isValid} onClick={() => setInfo()}>
        Save
      </Button>
    </Container>
  );
};
