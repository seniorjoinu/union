import React, { useMemo } from 'react';
import styled from 'styled-components';
import { PageWrapper, TextField as TF, Text, Button as B, ImageFile as IF } from 'components';
import { useForm, Controller } from 'react-hook-form';
import { checkPrincipal } from 'toolkit';
import { useSetInfo, useGetInfo, SetInfoFormData } from './useUnionInfo';

const ImageFile = styled(IF)``;
const Button = styled(B)``;
const TextField = styled(TF)``;

const LogoContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Container = styled(PageWrapper)`
  & > ${TextField}, ${LogoContainer} {
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
  const { data } = useGetInfo();

  const info: SetInfoFormData | null = useMemo(() => {
    if (!data) {
      return null;
    }

    return {
      name: data.name,
      description: data.description,
      logo: data.logo[0]
        ? new Blob([new Uint8Array(data.logo[0].content)], {
            type: data.logo[0].mime_type,
          })
        : null,
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
      <Controller
        name='logo'
        control={control}
        rules={{ required: 'Required field' }}
        render={({ field, fieldState: { error } }) => (
          <LogoContainer>
            <TextField
              type='file'
              accept='image/*'
              helperText={error?.message}
              label='image file'
              onChange={(e) => {
                const file = e.target.files?.item(0) || null;

                setValue('logo', file, { shouldValidate: true });
              }}
            />
            <ImageFile src={field.value} />
          </LogoContainer>
        )}
      />
      <Button type='submit' disabled={!isValid} onClick={() => setInfo()}>
        Save
      </Button>
    </Container>
  );
};
