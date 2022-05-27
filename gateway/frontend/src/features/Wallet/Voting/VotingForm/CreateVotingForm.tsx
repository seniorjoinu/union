import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Principal } from '@dfinity/principal';
import { PageWrapper, SubmitButton as SB } from '@union/components';
import { CreateVotingRequest, _SERVICE } from 'union-ts';
import { Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { EditorSettings, useRender } from '../../../IDLRenderer';
import { useUnionSubmit, AnyService } from '../../../../components/UnionSubmit';
import { VotingConfigListField } from '../../IDLFields';
import { MessageData } from '../types';

const SubmitButton = styled(SB)``;
const Container = styled(PageWrapper)`
  ${SubmitButton} {
    align-self: flex-start;
  }
`;

export interface CreateVotingFormProps extends IClassName {
  unionId: Principal;
  data?: MessageData;
  onSuccess?(response: any): void;
  renderResult?(index: number): React.ReactNode | null | void;
}

export function CreateVotingForm({
  unionId,
  onSuccess = () => undefined,
  data,
  renderResult,
  ...p
}: CreateVotingFormProps) {
  const nav = useNavigate();
  const submitProps = useUnionSubmit<AnyService & _SERVICE, 'create_voting'>({
    unionId,
    canisterId: unionId,
    methodName: 'create_voting',
    onExecuted: (p, res) => nav(`../choices/${res.id.toString()}`, { state: data }),
  });

  const { Form } = useRender<CreateVotingRequest>({
    canisterId: unionId,
    type: 'CreateVotingRequest',
  });

  const settings: EditorSettings<CreateVotingRequest> = useMemo(
    () => ({
      fields: {
        name: { order: 1, options: { required: 'Field is required' } },
        description: { order: 2, options: { required: 'Field is required' } },
        winners_need: { order: 3 },
        voting_config_id: {
          order: 4,
          adornment: {
            kind: 'replace',
            render: (ctx, path, name) => (
              <Controller
                name={path as 'voting_config_id'}
                control={ctx.control}
                rules={{ required: 'Field is required' }}
                render={({ field, fieldState: { error } }) => (
                  <VotingConfigListField
                    unionId={unionId}
                    label={name}
                    onChange={field.onChange}
                    value={field.value}
                    helperText={error?.message}
                  />
                )}
              />
            ),
          },
        },
      },
    }),
    [],
  );

  return (
    <Container title='Create new voting' withBack {...p}>
      <Form settings={settings} defaultValue={data?.voting}>
        {(ctx) => (
          <SubmitButton
            disabled={!ctx.isValid || !submitProps.isAllowed}
            onClick={(e) => submitProps.submit(e, [ctx.getValues()])}
          >
            Create voting
          </SubmitButton>
        )}
      </Form>
    </Container>
  );
}
