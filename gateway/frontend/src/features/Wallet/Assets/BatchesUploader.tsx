import React, { useCallback, useRef, useState } from 'react';
import styled from 'styled-components';
import { Controller, useForm } from 'react-hook-form';
import { PageWrapper, Text, TextField as TF, SubmitButton as B } from '@union/components';
import { useNavigate } from 'react-router-dom';
import { useBatchUploader } from './useBatchUploader';

const Button = styled(B)``;
const TextField = styled(TF)``;
const DeleteButton = styled(Button)``;

const Item = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;

  & > *:not(:last-child) {
    margin-right: 8px;
  }
`;

const Items = styled.div`
  display: flex;
  flex-direction: column;

  & > *:not(:last-child) {
    margin-bottom: 8px;
  }
`;
const Controls = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  & > *:not(:last-child) {
    margin-right: 8px;
  }
`;

const Container = styled(PageWrapper)`
  ${Items} {
    margin: 24px 0;
  }

  ${Controls} {
    align-self: flex-start;
  }
`;

export interface BatchesUploaderProps {
  className?: string;
  style?: React.CSSProperties;
}

interface FormData {
  batches: {
    folder: string;
    file: File;
  }[];
}

export const BatchesUploader = (p: BatchesUploaderProps) => {
  const nav = useNavigate();
  const [fetching, setFetching] = useState(false);
  const { upload } = useBatchUploader();
  const {
    control,
    getValues,
    setValue,
    formState: { isValid },
  } = useForm<FormData>({
    defaultValues: {
      batches: [],
    },
    mode: 'onChange',
  });

  const handleUpload = useCallback(async () => {
    const { batches } = getValues();

    if (!batches.length) {
      return;
    }

    setFetching(true);

    try {
      await Promise.all(batches.map(({ folder, file }) => upload({ file, prefix: folder })));
    } catch (e) {
      setFetching(false);
      throw e;
    }

    nav(-1);
  }, [upload, getValues, setValue, setFetching, nav]);

  return (
    <Container {...p} title='Upload batches' withBack>
      <Controller
        name='batches'
        control={control}
        rules={{ validate: { notEmpty: (value) => !!value.length || 'Select files' } }}
        render={({ field: batchesField, fieldState: { error } }) => (
          <>
            <TextField
              type='file'
              helperText={error?.message}
              multiple
              disabled={fetching}
              label='Select files'
              onChange={(e) => {
                const files = [...(e.target.files || [])];

                setValue(
                  'batches',
                  files.map((file) => ({ folder: '', file })),
                  { shouldValidate: true },
                );
              }}
            />
            <Items>
              {getValues().batches.map((b, i) => (
                <Item key={String(i)}>
                  <Controller
                    name={`batches.${i}.folder`}
                    control={control}
                    rules={{}}
                    render={({ field, fieldState: { error } }) => (
                      <Item>
                        <TextField
                          {...field}
                          disabled={fetching}
                          helperText={error?.message}
                          placeholder='Subfolder (optional)'
                        />
                        <Text>{batchesField.value[i]?.file.name}</Text>
                        <DeleteButton
                          color='red'
                          disabled={fetching}
                          onClick={() =>
                            batchesField.onChange(
                              batchesField.value.filter((_, index) => index !== i),
                            )
                          }
                        >
                          -
                        </DeleteButton>
                      </Item>
                    )}
                  />
                </Item>
              ))}
            </Items>
          </>
        )}
      />
      <Controls>
        <Button type='submit' disabled={!isValid || fetching} onClick={handleUpload}>
          Upload
        </Button>
      </Controls>
    </Container>
  );
};
