import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '@union/components';
import styled from 'styled-components';
import { CreateVotingConfigRequest } from 'union-ts';
import { Controller } from 'react-hook-form';
import { UnionSubmitButton } from '../../../../components/UnionSubmit';
import { useRender, FormContext, Settings, RenderContext } from '../../../IDLRenderer';
import { useCurrentUnion } from '../../context';
import { GroupListField } from '../../IDLFields';

const Container = styled(PageWrapper)``;

export interface CreateVotingConfigFormProps {
  className?: string;
  style?: React.CSSProperties;
}

export const CreateVotingConfigForm = styled(({ ...p }: CreateVotingConfigFormProps) => {
  const { principal } = useCurrentUnion();
  const nav = useNavigate();

  const { Form } = useRender<CreateVotingConfigRequest>({
    canisterId: principal,
    type: 'CreateVotingConfigRequest',
  });

  const useFormEffect = useCallback((ctx: FormContext<CreateVotingConfigRequest>) => {
    ctx.control.register('name', { required: 'Field is required' });
    ctx.control.register('description', { required: 'Field is required' });
  }, []);

  const settings: Settings<CreateVotingConfigRequest> = useMemo(
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
            render: (ctx: RenderContext<CreateVotingConfigRequest>, path, name) => (
              <Controller
                name={path as 'win.FractionOf.target.Group'}
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
        name: { order: 1 },
        description: { order: 2 },
        round: { order: 3 },
        winners_count: { order: 4, label: 'Winners limit' },
        choices_count: { order: 5, label: 'Choices limit' },
        permissions: { order: 6 },
        win: { order: 7 },
        rejection: { order: 8 },
        approval: { order: 9 },
        quorum: { order: 10 },
        next_round: { order: 11 },
      },
    }),
    [],
  );

  return (
    <Container title='Create new voting config' withBack {...p}>
      <Form useFormEffect={useFormEffect} settings={settings}>
        {(ctx) => (
          <UnionSubmitButton
            unionId={principal}
            canisterId={principal}
            methodName='create_voting_config'
            getPayload={() => [ctx.getValues() as CreateVotingConfigRequest]}
            onExecuted={() => nav(-1)}
            disabled={!ctx.isValid}
          >
            Create voting config
          </UnionSubmitButton>
        )}
      </Form>
    </Container>
  );
})``;
