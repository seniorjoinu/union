import React, { useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageWrapper } from '@union/components';
import styled from 'styled-components';
import { CreateNestedVotingConfigRequest } from 'union-ts';
import { Controller } from 'react-hook-form';
import { UnionSubmitButton } from '../../../../components/UnionSubmit';
import { useRender, EditorSettings, RenderEditorContext } from '../../../IDLRenderer';
import { useCurrentUnion } from '../../context';
import { GroupListField } from '../../IDLFields';

const Container = styled(PageWrapper)``;

export interface CreateNestedVotingConfigFormProps {
  className?: string;
  style?: React.CSSProperties;
}

export const CreateNestedVotingConfigForm = styled(
  ({ ...p }: CreateNestedVotingConfigFormProps) => {
    const { principal } = useCurrentUnion();
    const { votingConfigId } = useParams();
    const nav = useNavigate();

    const { Form, defaultValues, traversedIdlType, prog } = useRender<
      CreateNestedVotingConfigRequest
    >({
      canisterId: principal,
      type: 'CreateNestedVotingConfigRequest',
    });

    const useFormEffect = useCallback(
      (ctx: RenderEditorContext<CreateNestedVotingConfigRequest>) => {
        ctx.control.register('name', { required: 'Field is required' });
        ctx.control.register('description', { required: 'Field is required' });
      },
      [],
    );

    const defaultValue = useMemo(
      () => ({
        ...defaultValues,
        remote_union_id: principal,
        remote_voting_config_id: { Common: BigInt(votingConfigId || -1) },
      }),
      [defaultValues, votingConfigId],
    );

    const settings: EditorSettings<CreateNestedVotingConfigRequest> = useMemo(
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
      [],
    );

    if (!votingConfigId) {
      return <span>votingConfigId is empty</span>;
    }

    if (!traversedIdlType) {
      return <span>Wrong traversedIdlType</span>;
    }

    return (
      <Container title='Create nested voting config' withBack {...p}>
        <Form
          useFormEffect={useFormEffect}
          settings={settings}
          defaultValue={defaultValue as Partial<CreateNestedVotingConfigRequest>}
        >
          {(ctx) => (
            <UnionSubmitButton
              unionId={principal}
              canisterId={principal}
              methodName='create_nested_voting_config'
              getPayload={() => [ctx.getValues() as CreateNestedVotingConfigRequest]}
              onExecuted={() => nav(-1)}
              disabled={!ctx.isValid}
            >
              Create voting config
            </UnionSubmitButton>
          )}
        </Form>
      </Container>
    );
  },
)``;
