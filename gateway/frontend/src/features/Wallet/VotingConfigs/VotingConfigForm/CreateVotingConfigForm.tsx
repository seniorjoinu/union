import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '@union/components';
import styled from 'styled-components';
import { CreateVotingConfigRequest } from 'union-ts';
import { UnionSubmitButton } from '../../../../components/UnionSubmit';
import { useRender, FormContext } from '../../../IDLRenderer';
import { useCurrentUnion } from '../../context';

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
    // @ts-expect-error
    ctx.control.register('name', { required: 'Field is required' });
    ctx.control.register('description', { required: 'Field is required' });
  }, []);

  return (
    <Container title='Create new voting config' withBack {...p}>
      <Form useFormEffect={useFormEffect}>
        {(ctx) => (
          <UnionSubmitButton
            unionId={principal}
            canisterId={principal}
            methodName='create_voting_config'
            getPayload={() => [ctx.getValues() as CreateVotingConfigRequest]}
            onExecuted={() => nav(-1)}
            disabled={!ctx.formState.isValid}
          >
            Create voting config
          </UnionSubmitButton>
        )}
      </Form>
    </Container>
  );
})``;
