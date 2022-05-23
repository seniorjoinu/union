import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '@union/components';
import styled from 'styled-components';
import { CreateAccessConfigRequest } from 'union-ts';
import { UnionSubmitButton } from '../../../../components/UnionSubmit';
import { useRender, FormContext } from '../../../IDLRenderer';
import { useCurrentUnion } from '../../context';

const Container = styled(PageWrapper)``;

export interface CreateAccessConfigFormProps {
  className?: string;
  style?: React.CSSProperties;
}

export const CreateAccessConfigForm = styled(({ ...p }: CreateAccessConfigFormProps) => {
  const { principal } = useCurrentUnion();
  const nav = useNavigate();

  const { Form } = useRender<CreateAccessConfigRequest>({
    canisterId: principal,
    type: 'CreateAccessConfigRequest',
  });

  const useFormEffect = useCallback((ctx: FormContext<CreateAccessConfigRequest>) => {
    ctx.control.register('name', { required: 'Field is required' });
    ctx.control.register('description', { required: 'Field is required' });
  }, []);

  return (
    <Container title='Create new access config' withBack {...p}>
      <Form useFormEffect={useFormEffect}>
        {(ctx) => (
          <UnionSubmitButton
            unionId={principal}
            canisterId={principal}
            methodName='create_access_config'
            getPayload={() => [ctx.getValues() as CreateAccessConfigRequest]}
            onExecuted={() => nav(-1)}
            disabled={!ctx.formState.isValid}
          >
            Create access config
          </UnionSubmitButton>
        )}
      </Form>
    </Container>
  );
})``;
