import React, { useCallback, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import styled from 'styled-components';
import { useBackend } from '../../backend';
import { TextArea as TA, Markdown as MD, SubmitButton } from '../atoms';
import { withBorder } from '../withBorder';

const TextArea = withBorder(TA);
const Markdown = withBorder(MD);

const Zeroscreen = styled.span`
  color: grey;
`;

const Playground = styled.section`
  position: relative;
  display: flex;
  flex-direction: column;

  ${Zeroscreen} {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`;

const Tabs = styled.div`
  display: flex;
  flex-direction: row;

  & > * {
    padding: 4px;
    color: grey;
    cursor: pointer;
    transition: color 0.2s ease;

    &[aria-selected='true'],
    &:hover {
      color: black;
    }

    &:not(:last-child) {
      margin-right: 8px;
    }
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;

  ${SubmitButton} {
    margin-top: 8px;
    align-self: flex-start;
  }

  ${Markdown} {
    max-height: 800px;
  }
  ${TA} {
    padding: 8px;
  }
  ${MD} {
    padding: 8px;
    overflow: auto;
  }

  ${TextArea}, ${Markdown} {
    min-height: 100px;
    max-height: 800px;
  }
`;

export interface PostCreatorProps {
  className?: string;
  style?: React.CSSProperties;
  onSuccess?(): void;
}

export const PostCreator = ({ onSuccess = () => {}, ...p }: PostCreatorProps) => {
  const [mode, setMode] = useState('write');
  const { canister, fetching } = useBackend();
  const {
    control,
    setValue,
    getValues,
    formState: { isValid },
  } = useForm<{ content: string }>({
    defaultValues: {
      content: '',
    },
    mode: 'onChange',
  });

  const handlePublish = useCallback(async () => {
    await canister.add_post({ content: getValues().content });

    setValue('content', '');
    onSuccess();
  }, [getValues, setValue, onSuccess]);

  return (
    <Container {...p}>
      <Tabs>
        <div aria-selected={mode == 'write'} onClick={() => setMode('write')}>
          Write
        </div>
        <div aria-selected={mode == 'preview'} onClick={() => setMode('preview')}>
          Preview
        </div>
      </Tabs>
      <Playground>
        {mode == 'write' && (
          <Controller
            name='content'
            control={control}
            rules={{
              required: 'Required field',
              minLength: { value: 5, message: 'Content must be longer than 5 symbols' },
            }}
            render={({ field }) => (
              <TextArea
                {...field}
                disabled={!!fetching.add_post}
                placeholder='Type your thoughts here'
              />
            )}
          />
        )}
        {mode == 'preview' && <Markdown>{getValues().content}</Markdown>}
        {mode == 'preview' && !getValues().content && <Zeroscreen>No thoughts here</Zeroscreen>}
      </Playground>
      <SubmitButton
        disabled={!isValid || !!fetching.add_post}
        $loading={!!fetching.add_post}
        onClick={handlePublish}
      >
        Publish
      </SubmitButton>
    </Container>
  );
};
