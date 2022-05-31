import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageWrapper } from '@union/components';
import styled from 'styled-components';
import { UpdateVotingConfigRequest } from 'union-ts';
import { useUnion } from 'services';
import { Controller } from 'react-hook-form';
import { UnionSubmitButton } from '../../../../components/UnionSubmit';
import { EditorSettings, useRender } from '../../../IDLRenderer';
import { useCurrentUnion } from '../../context';
import { GroupListField, PermissionsListField, TimestampField } from '../../IDLFields';

const Container = styled(PageWrapper)``;

export interface UpdateVotingConfigFormProps {
  className?: string;
  style?: React.CSSProperties;
}

export const UpdateVotingConfigForm = styled(({ ...p }: UpdateVotingConfigFormProps) => {
  const { principal } = useCurrentUnion();
  const nav = useNavigate();
  const { votingConfigId } = useParams();
  const { canister, fetching, data } = useUnion(principal);
  const { Form } = useRender<UpdateVotingConfigRequest>({
    canisterId: principal,
    type: 'UpdateVotingConfigRequest',
  });

  useEffect(() => {
    if (!votingConfigId) {
      return;
    }

    canister.get_voting_config({ id: BigInt(votingConfigId), query_delegation_proof_opt: [] });
  }, [votingConfigId]);

  const defaultValue: UpdateVotingConfigRequest | undefined = useMemo(() => {
    const votingConfig = data.get_voting_config?.voting_config;

    if (!votingConfigId || !votingConfig) {
      return;
    }

    return {
      id: BigInt(votingConfigId),
      description_opt: [votingConfig.description],
      next_round_opt: [votingConfig.next_round],
      name_opt: [votingConfig.name],
      quorum_opt: [votingConfig.quorum],
      approval_opt: [votingConfig.approval],
      round_opt: [votingConfig.round],
      choices_count_opt: [votingConfig.choices_count],
      winners_count_opt: [votingConfig.winners_count],
      rejection_opt: [votingConfig.rejection],
      win_opt: [votingConfig.win],
      permissions_opt: [votingConfig.permissions],
    };
  }, [votingConfigId, data.get_voting_config?.voting_config]);

  // @ts-ignore
  const settings: EditorSettings<UpdateVotingConfigRequest> = useMemo(
    () => ({
      rules: {
        'FractionOf.fraction': {
          order: 1,
          placeholder: 'Float from 0 to 1',
          options: {
            validate: {
              lessOne: (v) => parseFloat(v) <= 1 || 'Must be less or equal 1',
              biggerZero: (v) => parseFloat(v) >= 0 || 'Must be bigger or equal 0',
            },
          },
        },
        'QuantityOf.quantity': { order: 1 },
        'target.Group': {
          adornment: {
            kind: 'replace',
            render: (ctx, path, name) => (
              <Controller
                name={path as 'win_opt.0.FractionOf.target.Group'}
                control={ctx.control}
                render={({ field, fieldState: { error } }) => (
                  <GroupListField
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
      // @ts-ignore
      fields: {
        id: { hide: true },
        name_opt: { order: 1 },
        description_opt: { order: 2 },
        round_opt: { order: 3 },
        winners_count_opt: { order: 4 },
        choices_count_opt: { order: 5 },
        permissions_opt: {
          order: 6,
          adornment: {
            kind: 'replace',
            render: (ctx, path, name) => (
              <Controller
                name='permissions_opt.0'
                control={ctx.control}
                render={({ field, fieldState: { error } }) => (
                  <PermissionsListField
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
        win_opt: { order: 7 },
        rejection_opt: { order: 8 },
        approval_opt: { order: 9 },
        quorum_opt: { order: 10 },
        next_round_opt: { order: 11 },
        'round_opt.0.round_delay': {
          adornment: {
            kind: 'replace',
            render: (ctx, path, name) => (
              <Controller
                name='round_opt.0.round_delay'
                control={ctx.control}
                rules={{
                  required: 'Wrong value',
                }}
                render={({ field, fieldState: { error } }) => (
                  <TimestampField {...field} helperText={error?.message} label={name} />
                )}
              />
            ),
          },
        },
        'round_opt.0.round_duration': {
          adornment: {
            kind: 'replace',
            render: (ctx, path, name) => (
              <Controller
                name='round_opt.0.round_duration'
                control={ctx.control}
                rules={{
                  required: 'Wrong value',
                }}
                render={({ field, fieldState: { error } }) => (
                  <TimestampField {...field} helperText={error?.message} label={name} />
                )}
              />
            ),
          },
        },
      },
    }),
    [defaultValue],
  );

  if (!votingConfigId) {
    return <span>votingConfigId is empty</span>;
  }

  if (fetching.get_voting_config) {
    return <span>fetching</span>;
  }

  if (!data.get_voting_config?.voting_config || !defaultValue) {
    return <span>Voting config does not found</span>;
  }

  return (
    <Container title='Update voting config' withBack {...p}>
      <Form
        defaultValue={defaultValue}
        settings={settings}
        transformLabel={(v, tr) => tr(v?.replace('_opt', ''))}
      >
        {(ctx) => (
          <UnionSubmitButton
            unionId={principal}
            canisterId={principal}
            methodName='update_voting_config'
            getPayload={() => [ctx.getValues() as UpdateVotingConfigRequest]}
            onExecuted={() => nav(-1)}
            disabled={!ctx.isValid}
          >
            Update voting config
          </UnionSubmitButton>
        )}
      </Form>
    </Container>
  );
})``;
