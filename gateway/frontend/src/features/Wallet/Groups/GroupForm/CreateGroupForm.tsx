import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '@union/components';
import styled from 'styled-components';
import { CreateGroupRequest } from 'union-ts';
import { UnionSubmitButton } from '../../../../components/UnionSubmit';
import { useRender, RenderEditorContext, EditorSettings } from '../../../IDLRenderer';
import { useCurrentUnion } from '../../context';

const Container = styled(PageWrapper)``;

export interface CreateGroupFormProps {
  className?: string;
  style?: React.CSSProperties;
}

export const CreateGroupForm = styled(({ ...p }: CreateGroupFormProps) => {
  const { principal } = useCurrentUnion();
  const nav = useNavigate();

  const { Form } = useRender<CreateGroupRequest>({
    canisterId: principal,
    type: 'CreateGroupRequest',
  });

  const useFormEffect = useCallback((ctx: RenderEditorContext<CreateGroupRequest>) => {
    ctx.control.register('name', { required: 'Field is required' });
    ctx.control.register('description', { required: 'Field is required' });
  }, []);

  const settings: EditorSettings<CreateGroupRequest> = useMemo(
    () => ({
      rules: {},
      fields: {
        name: { order: 1 },
        description: { order: 2, multiline: true },
        private: { order: 3, label: 'Is private?' },
        transferable: { order: 4, label: 'Is transferable?' },
      },
    }),
    [],
  );

  return (
    <Container title='Create new group' withBack {...p}>
      <Form useFormEffect={useFormEffect} settings={settings}>
        {(ctx) => (
          <UnionSubmitButton
            unionId={principal}
            canisterId={principal}
            methodName='create_group'
            getPayload={() => [ctx.getValues() as CreateGroupRequest]}
            onExecuted={() => nav(-1)}
            disabled={!ctx.isValid}
          >
            Create group
          </UnionSubmitButton>
        )}
      </Form>
    </Container>
  );
})``;
