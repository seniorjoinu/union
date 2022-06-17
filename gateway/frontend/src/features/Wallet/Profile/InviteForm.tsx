import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '@union/components';
import styled from 'styled-components';
import { CreateProfileRequest } from 'union-ts';
import { UnionSubmitButton as SB } from '../../../components/UnionSubmit';
import { useRender, EditorSettings } from '../../IDLRenderer';
import { useCurrentUnion } from '../context';

const UnionSubmitButton = styled(SB)``;
const Container = styled(PageWrapper)`
  ${UnionSubmitButton} {
    align-self: flex-start;
    margin-top: 16px;
  }
`;

export interface InviteFormProps {
  className?: string;
  style?: React.CSSProperties;
}

export const InviteForm = styled(({ ...p }: InviteFormProps) => {
  const { principal } = useCurrentUnion();
  const nav = useNavigate();

  const { Form } = useRender<CreateProfileRequest>({
    canisterId: principal,
    type: 'CreateProfileRequest',
  });

  const settings: EditorSettings<CreateProfileRequest> = useMemo(
    () => ({
      rules: {},
      fields: {
        name: {
          options: {
            validate: { length: (v) => (v && String(v).length > 1) || 'This field is required' },
          },
        },
        description: {
          multiline: true,
          options: {
            validate: { length: (v) => (v && String(v).length > 1) || 'This field is required' },
          },
        },
      },
    }),
    [],
  );

  return (
    <Container title='Invite new participant' withBack {...p}>
      <Form settings={settings}>
        {(ctx) => (
          <UnionSubmitButton
            unionId={principal}
            canisterId={principal}
            methodName='create_profile'
            getPayload={() => [ctx.getValues() as CreateProfileRequest]}
            onExecuted={() => nav(-1)}
          >
            Invite
          </UnionSubmitButton>
        )}
      </Form>
    </Container>
  );
})``;
