import React, { useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { Principal } from '@dfinity/principal';
import { PageWrapper, SubmitButton as SB } from '@union/components';
import { UpdateVotingChoiceRequest, _SERVICE } from 'union-ts';
import { useParams } from 'react-router-dom';
import { useUnion } from 'services';
import { Controller, useWatch } from 'react-hook-form';
import { CandidPayload, CanisterMethods } from '../../../IDLFields';
import { EditorSettings, useRender } from '../../../../IDLRenderer';
import { useUnionSubmit } from '../../../../../components/UnionSubmit';

const SubmitButton = styled(SB)``;
const Container = styled(PageWrapper)`
  ${SubmitButton} {
    align-self: flex-start;
  }
`;

export interface UpdateChoiceFormProps extends IClassName {
  unionId: Principal;
  nested?: boolean;
  onSuccess?(response: any): void;
}

export function UpdateChoiceForm({
  unionId,
  onSuccess = () => undefined,
  nested,
  ...p
}: UpdateChoiceFormProps) {
  const { choiceId, votingId } = useParams();
  const { canister, data, fetching } = useUnion(unionId);
  const submitProps = useUnionSubmit({
    unionId,
    canisterId: unionId,
    methodName: 'update_voting_choice',
    onExecuted: (p, res) => onSuccess(res),
  });

  const { Form } = useRender<UpdateVotingChoiceRequest>({
    canisterId: unionId,
    type: 'UpdateVotingChoiceRequest',
  });

  useEffect(() => {
    if (!choiceId || !votingId) {
      return;
    }

    const remoteVotingId = nested ? { Nested: BigInt(votingId) } : { Common: BigInt(votingId) };

    canister.get_voting_choice({
      choice_id: BigInt(choiceId),
      voting_id: remoteVotingId,
      query_delegation_proof_opt: [],
    });
  }, [choiceId, votingId]);

  const defaultValue: UpdateVotingChoiceRequest | undefined = useMemo(() => {
    const choice = data.get_voting_choice?.choice;

    if (!choiceId || !choice) {
      return;
    }

    return {
      choice_id: BigInt(choiceId),
      new_name: [choice.name],
      new_description: [choice.description],
      new_program: [choice.program],
    };
  }, [choiceId, data.get_voting_choice?.choice]);

  const settings: EditorSettings<UpdateVotingChoiceRequest> = useMemo(
    () => ({
      fields: {
        choice_id: { hide: true },
        new_name: { order: 1 },
        new_description: { order: 2 },
        new_program: { order: 3 },
        'new_program.0.RemoteCallSequence.-1.endpoint.canister_id': {
          label: 'Canister Id',
        },
        'new_program.0.RemoteCallSequence.-1.endpoint.method_name': {
          label: 'Method name',
          adornment: {
            kind: 'replace',
            render: (ctx, path, name) => (
              <Controller
                name={path as 'new_program.0.RemoteCallSequence.-1.endpoint.method_name'}
                control={ctx.control}
                render={({ field, fieldState: { error } }) => (
                  <CanisterMethods
                    label={name}
                    canisterId={useWatch({
                      name: path.replace(
                        'method_name',
                        'canister_id',
                      ) as 'new_program.0.RemoteCallSequence.-1.endpoint.canister_id',
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
        'new_program.0.RemoteCallSequence.-1.args': {
          label: 'Candid',
          adornment: {
            kind: 'replace',
            render: (ctx, path, name) => (
              <Controller
                name={path as 'new_program.0.RemoteCallSequence.-1.args'}
                control={ctx.control}
                rules={{ required: 'Arguments is required' }}
                render={({ field, fieldState: { error } }) => {
                  const canisterId = useWatch({
                    name: path.replace(
                      'args',
                      'endpoint.canister_id',
                    ) as 'new_program.0.RemoteCallSequence.-1.endpoint.canister_id',
                    control: ctx.control,
                  });
                  const methodName = useWatch({
                    name: path.replace(
                      'args',
                      'endpoint.method_name',
                    ) as 'new_program.0.RemoteCallSequence.-1.endpoint.method_name',
                    control: ctx.control,
                  });

                  if (!canisterId || !methodName) {
                    return <></>;
                  }
                  return (
                    <CandidPayload
                      canisterId={canisterId}
                      methodName={methodName}
                      value={
                        field.value && 'Encoded' in field.value
                          ? Buffer.from(field.value.Encoded)
                          : null
                      }
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
    }),
    [choiceId, nested],
  );

  if (!choiceId) {
    return <span>choiceId is empty</span>;
  }

  if (fetching.get_voting_choice) {
    return <span>fetching</span>;
  }

  if (!data.get_voting_choice?.choice || !defaultValue) {
    return <span>Choice does not found</span>;
  }

  return (
    <Container title='Update choice' withBack {...p}>
      <Form settings={settings} defaultValue={defaultValue}>
        {(ctx) => (
          <SubmitButton
            disabled={!ctx.isValid || !submitProps.isAllowed}
            onClick={(e) => submitProps.submit(e, [ctx.getValues()])}
          >
            Update
          </SubmitButton>
        )}
      </Form>
    </Container>
  );
}
