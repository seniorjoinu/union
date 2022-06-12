import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Principal } from '@dfinity/principal';
import { IDL } from '@dfinity/candid';
import { PageWrapper, Row, SubmitButton as SB } from '@union/components';
import { CreateVotingChoiceRequest, _SERVICE } from 'union-ts';
import { useParams } from 'react-router-dom';
import { TId, TProg } from '@union/candid-parser';
import { Controller, useWatch } from 'react-hook-form';
import { EditorSettings, useRender } from '../../../../IDLRenderer';
import { useUnionRepeatSubmit } from '../../../../../components/UnionSubmit';
import { MessageData } from '../../../../useClient';
import { CandidPayload, CanisterMethods } from '../../../IDLFields';

const SubmitButton = styled(SB)``;
const Container = styled(PageWrapper)`
  ${SubmitButton} {
    align-self: flex-start;
  }
`;

type MultipleChoicesFormType = { choices: CreateVotingChoiceRequest[] };

export interface MultipleChoicesFormProps extends IClassName {
  unionId: Principal;
  data?: MessageData;
  nested?: boolean;
  onSuccess?(response: any): void;
  renderResult?(index: number): React.ReactNode | null | void;
}

export function MultipleChoicesForm({
  unionId,
  onSuccess = () => undefined,
  data,
  renderResult,
  nested,
  ...p
}: MultipleChoicesFormProps) {
  const { votingId } = useParams();
  const submitProps = useUnionRepeatSubmit({
    unionId,
    program: {
      canisterId: unionId,
      methodName: 'create_voting_choice',
    },
    onExecuted: (p, res) => onSuccess(res),
  });

  const type = useCallback(
    (prog: TProg) =>
      IDL.Record({ choices: IDL.Vec(prog.traverseIdlType(new TId('CreateVotingChoiceRequest'))) }),
    [],
  );
  const { Form } = useRender<MultipleChoicesFormType>({
    canisterId: unionId,
    type,
  });

  const settings: EditorSettings<MultipleChoicesFormType> = useMemo(() => {
    const defaultVotingId = votingId
      ? nested
        ? { Nested: BigInt(votingId) }
        : { Common: BigInt(votingId) }
      : null;

    return {
      fields: {
        'choices.-1.name': { order: 1, options: { required: 'Field is required' } },
        'choices.-1.description': {
          order: 2,
          options: { required: 'Field is required' },
          multiline: true,
        },
        'choices.-1.voting_id': { hide: true, disabled: true, defaultValue: defaultVotingId },
        'choices.-1.program.RemoteCallSequence.-1.endpoint.canister_id': {
          label: 'Canister Id',
        },
        'choices.-1.program.RemoteCallSequence.-1.endpoint.method_name': {
          label: 'Method name',
          adornment: {
            kind: 'replace',
            render: (ctx, path, name) => (
              <Controller
                name={path as 'choices.-1.program.RemoteCallSequence.-1.endpoint.method_name'}
                control={ctx.control}
                render={({ field, fieldState: { error } }) => (
                  <CanisterMethods
                    label={name}
                    canisterId={useWatch({
                      name: path.replace(
                        'method_name',
                        'canister_id',
                      ) as 'choices.-1.program.RemoteCallSequence.-1.endpoint.canister_id',
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
        'choices.-1.program.RemoteCallSequence.-1.args': {
          label: 'Candid',
          adornment: {
            kind: 'replace',
            render: (ctx, path, name) => (
              <Controller
                name={path as 'choices.-1.program.RemoteCallSequence.-1.args'}
                control={ctx.control}
                rules={{ required: 'Arguments is required' }}
                render={({ field, fieldState: { error } }) => {
                  const canisterId = useWatch({
                    name: path.replace(
                      'args',
                      'endpoint.canister_id',
                    ) as 'choices.-1.program.RemoteCallSequence.-1.endpoint.canister_id',
                    control: ctx.control,
                  });
                  const methodName = useWatch({
                    name: path.replace(
                      'args',
                      'endpoint.method_name',
                    ) as 'choices.-1.program.RemoteCallSequence.-1.endpoint.method_name',
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
                      value={'Encoded' in field.value ? Buffer.from(field.value.Encoded) : null}
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

  // @ts-expect-error
  const defaultValue: MultipleChoicesFormType = useMemo(
    () => ({
      choices: data?.choices
        ? data?.choices
        : [{ name: '', description: '', program: { Empty: null } }],
    }),
    [data],
  );

  return (
    <Container title='Add choices to voting' withBack {...p}>
      <Form settings={settings} defaultValue={defaultValue}>
        {(ctx) => (
          <Row>
            <SubmitButton
              disabled={!ctx.isValid || !submitProps.isAllowed}
              onClick={(e) => {
                const value = ctx.getValues('choices').map((v) => [{ ...v }]);

                return submitProps.submit(e, value);
              }}
            >
              Submit choices
            </SubmitButton>
            <SubmitButton onClick={onSuccess}>Skip</SubmitButton>
          </Row>
        )}
      </Form>
    </Container>
  );
}
