import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageWrapper } from '@union/components';
import styled from 'styled-components';
import { UpdateNestedVotingConfigRequest } from 'union-ts';
import { useUnion } from 'services';
import { Controller } from 'react-hook-form';
import { UnionSubmitButton } from '../../../../components/UnionSubmit';
import { EditorSettings, useRender } from '../../../IDLRenderer';
import { useCurrentUnion } from '../../context';
import { GroupListField } from '../../IDLFields';

const Container = styled(PageWrapper)``;

export interface UpdateNestedVotingConfigFormProps {
  className?: string;
  style?: React.CSSProperties;
}

export const UpdateNestedVotingConfigForm = styled(
  ({ ...p }: UpdateNestedVotingConfigFormProps) => {
    const { principal } = useCurrentUnion();
    const nav = useNavigate();
    const { votingConfigId } = useParams();
    const { canister, fetching, data } = useUnion(principal);
    const { Form } = useRender<UpdateNestedVotingConfigRequest>({
      canisterId: principal,
      type: 'UpdateNestedVotingConfigRequest',
    });

    useEffect(() => {
      if (!votingConfigId) {
        return;
      }

      canister.get_nested_voting_config({
        id: BigInt(votingConfigId),
        query_delegation_proof_opt: [],
      });
    }, [votingConfigId]);

    const defaultValue: UpdateNestedVotingConfigRequest | undefined = useMemo(() => {
      const votingConfig = data.get_nested_voting_config?.nested_voting_config;

      if (!votingConfigId || !votingConfig) {
        return;
      }

      return {
        id: BigInt(votingConfigId),
        description_opt: [votingConfig.description],
        name_opt: [votingConfig.name],
        vote_calculation_opt: [votingConfig.vote_calculation],
        // allowee_groups_opt: [votingConfig.allowee_groups],
        allowee_groups_opt: [],
      };
    }, [votingConfigId, data.get_nested_voting_config?.nested_voting_config]);

    // @ts-ignore
    const settings: EditorSettings<UpdateVotingConfigRequest> = useMemo(
      () => ({
        rules: {},
        fields: {
          name: { order: 1 },
          description: { order: 2 },
          remote_voting_config_id: { order: 3 },
          remote_union_id: { order: 4 },
          vote_calculation: { order: 5 },
          allowee_groups: { order: 6 },
          'allowee_groups.-1.0': {
            label: 'Group id',
            adornment: {
              kind: 'replace',
              render: (ctx, path, name) => (
                <Controller
                  name={path as 'allowee_groups.-1.0'}
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
          'allowee_groups.-1.1': {
            label: 'Fraction',
            placeholder: 'Float from 0 to 1',
            options: {
              validate: {
                lessOne: (v) => parseFloat(v) <= 1 || 'Must be less or equal 1',
                biggerZero: (v) => parseFloat(v) >= 0 || 'Must be bigger or equal 0',
              },
            },
          },
        },
      }),
      [defaultValue],
    );

    if (!votingConfigId) {
      return <span>votingConfigId is empty</span>;
    }

    if (fetching.get_nested_voting_config) {
      return <span>fetching</span>;
    }

    if (!data.get_nested_voting_config?.nested_voting_config || !defaultValue) {
      return <span>Voting config does not found</span>;
    }

    return (
      <Container title='Update nested voting config' withBack {...p}>
        <Form
          defaultValue={defaultValue}
          settings={settings}
          transformLabel={(v, tr) => tr(v?.replace('_opt', ''))}
        >
          {(ctx) => (
            <UnionSubmitButton
              unionId={principal}
              canisterId={principal}
              methodName='update_nested_voting_config'
              getPayload={() => [ctx.getValues() as UpdateNestedVotingConfigRequest]}
              onExecuted={() => nav(-1)}
              disabled={!ctx.isValid}
            >
              Update voting config
            </UnionSubmitButton>
          )}
        </Form>
      </Container>
    );
  },
)``;
