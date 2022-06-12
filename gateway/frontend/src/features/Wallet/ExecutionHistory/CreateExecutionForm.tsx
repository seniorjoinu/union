import React, { useMemo } from 'react';
import styled from 'styled-components';
import { PageWrapper, SubmitButton as SB } from '@union/components';
import { ExecuteRequest, ExecuteResponse, _SERVICE } from 'union-ts';
import { Controller, useWatch } from 'react-hook-form';
import { useUnion } from 'services';
import { useNavigate } from 'react-router-dom';
import { MessageData } from '@union/client';
import { EditorSettings, useRender } from '../../IDLRenderer';
import { CanisterMethods, CandidPayload, AccessConfigListField } from '../IDLFields';
import { useCurrentUnion } from '../context';

const SubmitButton = styled(SB)``;
const Container = styled(PageWrapper)`
  ${SubmitButton} {
    align-self: flex-start;
  }
`;

export interface CreateExecutionFormProps extends IClassName {
  data?: MessageData;
  onSuccess?(response: ExecuteResponse): void;
}

export function CreateExecutionForm({
  onSuccess = () => undefined,
  data,
  ...p
}: CreateExecutionFormProps) {
  const { principal: unionId } = useCurrentUnion();
  const { canister } = useUnion(unionId);
  const nav = useNavigate();

  const { Form } = useRender<ExecuteRequest>({
    canisterId: unionId,
    type: 'ExecuteRequest',
  });

  const settings: EditorSettings<ExecuteRequest> = useMemo(
    () => ({
      fields: {
        access_config_id: {
          adornment: {
            kind: 'replace',
            render: (ctx, path, name) => (
              <Controller
                name={path as 'access_config_id'}
                control={ctx.control}
                render={({ field, fieldState: { error } }) => (
                  <AccessConfigListField
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
    }),
    [],
  );

  return (
    <Container title='Create arbitrary execution' withBack {...p}>
      <Form
        settings={settings}
        defaultValue={
          data?.choices?.[0]?.program ? { program: data.choices[0].program } : undefined
        }
      >
        {(ctx) => (
          <SubmitButton
            disabled={!ctx.isValid}
            onClick={async (e) => {
              const res = await canister.execute(ctx.getValues() as ExecuteRequest);

              nav(-1);
              return onSuccess(res);
            }}
          >
            Execute
          </SubmitButton>
        )}
      </Form>
    </Container>
  );
}
