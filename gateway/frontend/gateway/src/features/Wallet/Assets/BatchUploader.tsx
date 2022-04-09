import React, { useCallback, useRef } from 'react';
import styled from 'styled-components';
import { Controller, useForm } from 'react-hook-form';
import { PageWrapper, Text, TextField as TF, SubmitButton as B } from 'components';
import { useBatchUploader, Stats } from '../useBatchUploader';

const Button = styled(B)``;
const TextField = styled(TF)``;

const Controls = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  & > *:not(:last-child) {
    margin-right: 8px;
  }
`;

const Container = styled(PageWrapper)`
  ${TextField} {
    margin-bottom: 24px;
  }

  ${Controls} {
    align-self: flex-start;
  }
`;

export interface BatchUploaderProps {
  className?: string;
  style?: React.CSSProperties;
  onUploaded?(): void;
}

interface FormData {
  folder: string;
  file: File | null;
}

export const BatchUploader = ({ onUploaded, ...p }: BatchUploaderProps) => {
  const [stats, setStats] = React.useState<Stats>({ uploaded: 0, of: 0 });
  const { upload, fetching } = useBatchUploader({ progress: setStats });
  const {
    control,
    getValues,
    setValue,
    formState: { isValid },
  } = useForm<FormData>({
    defaultValues: {
      folder: '',
      file: null,
    },
    mode: 'onTouched',
  });

  const handleUpload = useCallback(async () => {
    const { folder, file } = getValues();

    if (!file) {
      return;
    }

    await upload({ file, prefix: folder });

    if (onUploaded) {
      onUploaded();
    }
  }, [upload, getValues, onUploaded, setValue]);

  return (
    <Container {...p} title='Upload batches' withBack>
      <Controller
        name='folder'
        control={control}
        rules={{}}
        render={({ field, fieldState: { error } }) => (
          <TextField {...field} helperText={error?.message} label='Subfolder (optional)' />
        )}
      />
      <Controller
        name='file'
        control={control}
        rules={{ required: 'Required field' }}
        render={({ fieldState: { error } }) => (
          <TextField
            type='file'
            helperText={error?.message}
            label='Select file'
            onChange={(e) => {
              const file = e.target.files?.item(0) || null;

              setValue('file', file, { shouldValidate: true });
            }}
          />
        )}
      />
      <Controls>
        <Button type='submit' disabled={!isValid || fetching} onClick={handleUpload}>
          Upload
        </Button>
        {fetching && (
          <Text>
            uploaded chunks {stats.uploaded}/{stats.of}
          </Text>
        )}
      </Controls>
    </Container>
  );
};
