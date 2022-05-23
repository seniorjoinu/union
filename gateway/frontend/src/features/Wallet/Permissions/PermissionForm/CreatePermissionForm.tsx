import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '@union/components';
import styled from 'styled-components';
import { CreatePermissionRequest } from 'union-ts';
import { UnionSubmitButton } from '../../../../components/UnionSubmit';
import { useRender, FormContext } from '../../../IDLRenderer';
import { useCurrentUnion } from '../../context';

const Container = styled(PageWrapper)``;

export interface CreatePermissionFormProps {
  className?: string;
  style?: React.CSSProperties;
}

export const CreatePermissionForm = styled(({ ...p }: CreatePermissionFormProps) => {
  const { principal } = useCurrentUnion();
  const nav = useNavigate();

  const { Form } = useRender<CreatePermissionRequest>({
    canisterId: principal,
    type: 'CreatePermissionRequest',
  });

  const useFormEffect = useCallback((ctx: FormContext<CreatePermissionRequest>) => {
    ctx.control.register('name', { required: 'Field is required' });
    ctx.control.register('description', { required: 'Field is required' });
  }, []);

  return (
    <Container title='Create new permission' withBack {...p}>
      <Form useFormEffect={useFormEffect}>
        {(ctx) => (
          <UnionSubmitButton
            unionId={principal}
            canisterId={principal}
            methodName='create_permission'
            getPayload={() => [ctx.getValues() as CreatePermissionRequest]}
            onExecuted={() => nav(-1)}
            disabled={!ctx.formState.isValid}
          >
            Create permission
          </UnionSubmitButton>
        )}
      </Form>
    </Container>
  );
})``;
