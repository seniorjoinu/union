import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Principal } from '@dfinity/principal';
import { PageWrapper, SubmitButton as SB } from '@union/components';
import { CreateVotingChoiceRequest, _SERVICE } from 'union-ts';
import { useParams } from 'react-router-dom';
import { Controller, useWatch } from 'react-hook-form';
import { EditorSettings, useRender } from '../../../../IDLRenderer';
import { useUnionSubmit } from '../../../../../components/UnionSubmit';
import { CanisterMethods, CandidPayload } from '../../../IDLFields';
import { MessageData } from '../types';

const SubmitButton = styled(SB)``;
const Container = styled(PageWrapper)`
  ${SubmitButton} {
    align-self: flex-start;
  }
`;

export interface CreateChoiceFormProps extends IClassName {
  unionId: Principal;
  nested?: boolean;
  onSuccess?(response: any): void;
}

export function CreateChoiceForm({
  unionId,
  onSuccess = () => undefined,
  nested,
  ...p
}: CreateChoiceFormProps) {
  const { votingId } = useParams();
  const submitProps = useUnionSubmit({
    unionId,
    canisterId: unionId,
    methodName: 'create_voting_choice',
    onExecuted: (p, res) => onSuccess(res),
  });

  const { Form } = useRender<CreateVotingChoiceRequest>({
    canisterId: unionId,
    type: 'CreateVotingChoiceRequest',
  });

  const settings: EditorSettings<CreateVotingChoiceRequest> = useMemo(() => {
    const defaultVotingId = votingId
      ? nested
        ? { Nested: BigInt(votingId) }
        : { Common: BigInt(votingId) }
      : null;

    return {
      fields: {
        name: { order: 1, options: { required: 'Field is required' } },
        description: { order: 2, options: { required: 'Field is required' } },
        voting_id: { hide: true, disabled: true, defaultValue: defaultVotingId },
        'program.RemoteCallSequence.-1.endpoint.canister_id': {
          label: 'Canister Id',
        },
        'program.RemoteCallSequence.-1.endpoint.method_name': {
          label: 'Method name',
          adornment: {
            kind: 'replace',
            render: (ctx, path, name) => (
              <Controller
                name={path as 'program.RemoteCallSequence.-1.endpoint.method_name'}
                control={ctx.control}
                render={({ field, fieldState: { error } }) => (
                  <CanisterMethods
                    label={name}
                    canisterId={useWatch({
                      name: path.replace(
                        'method_name',
                        'canister_id',
                      ) as 'program.RemoteCallSequence.-1.endpoint.canister_id',
                      control: ctx.control,
                    })}
                    onChange={field.onChange}
                    value={field.value}
                    helperText={error?.message}
                  />
                )}
              />
            ),
          },
        },
        'program.RemoteCallSequence.-1.args': {
          label: 'Candid',
          adornment: {
            kind: 'replace',
            render: (ctx, path, name) => (
              <Controller
                name={path as 'program.RemoteCallSequence.-1.args'}
                control={ctx.control}
                rules={{ required: 'Arguments is required' }}
                render={({ field, fieldState: { error } }) => {
                  const canisterId = useWatch({
                    name: path.replace(
                      'args',
                      'endpoint.canister_id',
                    ) as 'program.RemoteCallSequence.-1.endpoint.canister_id',
                    control: ctx.control,
                  });
                  const methodName = useWatch({
                    name: path.replace(
                      'args',
                      'endpoint.method_name',
                    ) as 'program.RemoteCallSequence.-1.endpoint.method_name',
                    control: ctx.control,
                  });

                  if (!canisterId || !methodName) {
                    return <></>;
                  }
                  return (
                    <CandidPayload
                      canisterId={canisterId}
                      methodName={methodName}
                      onChange={(buffer) =>
                        field.onChange(
                          buffer ? { Encoded: [...new Uint8Array(buffer)] } : undefined,
                        )
                      }
                    />
                  );
                }}
              />
            ),
          },
        },
      },
    };
  }, [votingId, nested]);

  return (
    <Container title='Create choice' withBack {...p}>
      <Form settings={settings}>
        {(ctx) => (
          <SubmitButton
            disabled={!ctx.isValid || !submitProps.isAllowed}
            onClick={(e) => submitProps.submit(e, [ctx.getValues()])}
          >
            Create
          </SubmitButton>
        )}
      </Form>
    </Container>
  );
}
