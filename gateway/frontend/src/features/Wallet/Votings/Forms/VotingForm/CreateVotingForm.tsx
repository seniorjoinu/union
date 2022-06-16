import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Principal } from '@dfinity/principal';
import { PageWrapper, SubmitButton as SB } from '@union/components';
import { CreateVotingRequest, _SERVICE } from 'union-ts';
import { Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { getMethodAccessVotingConfig, useUnion } from 'services';
import { EditorSettings, useRender } from '../../../../IDLRenderer';
import { useUnionSubmit, AnyService } from '../../../../../components/UnionSubmit';
import { VotingConfigListField } from '../../../IDLFields';
import { MessageData } from '../../../../useClient';

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
    onExecuted: (p, res) => nav(`../choices/${res.id.toString()}`, { state: data, replace: true }),
  });
  const { canister } = useUnion(unionId);
  const [filterConfigs, setFilterConfigs] = useState<bigint[] | undefined>(undefined);

  const { Form } = useRender<CreateVotingRequest>({
    canisterId: unionId,
    type: 'CreateVotingRequest',
  });

  useEffect(() => {
    if (!data || !data.choices) {
      return;
    }
    const endpoints = data.choices
      .map((c) =>
        (c.program && 'RemoteCallSequence' in c.program
          ? c.program.RemoteCallSequence.map((p) => p.endpoint)
          : []),
      )
      .flat();

    if (!endpoints.length) {
      return;
    }
    getMethodAccessVotingConfig({
      program: endpoints.map((e) => ({ canisterId: e.canister_id, methodName: e.method_name })),
      canister,
    })
      .then((configs) => {
        const first = configs[0]?.votingConfigs || [];

        const res = first
          .filter((c) => configs.find((cc) => cc.votingConfigs.find((vc) => vc.id[0] == c.id[0])))
          .map((c) => c.id[0]!);

        return res;
      })
      .then(setFilterConfigs);
  }, []);

  const settings: EditorSettings<CreateVotingRequest> = useMemo(
    () => ({
      fields: {
        name: { order: 1, options: { required: 'Field is required' } },
        description: { order: 2, options: { required: 'Field is required' }, multiline: true },
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
                    allowOnly={filterConfigs}
                  />
                )}
              />
            ),
          },
        },
      },
    }),
    [filterConfigs],
  );

  return (
    <Container title='Create random voting' withBack {...p}>
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
