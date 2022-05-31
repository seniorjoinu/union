import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper, SubmitButton as SB } from '@union/components';
import styled from 'styled-components';
import { CreateProfileRequest, UpdateAccessConfigRequest } from 'union-ts';
import { UNLIMITED_ACCESS_CONFIG_ID } from 'envs';
import { useUnion } from 'services';
import { useUnionMultipleSubmit } from '../../../components/UnionSubmit';
import { useRender, EditorSettings } from '../../IDLRenderer';
import { useCurrentUnion } from '../context';

const SubmitButton = styled(SB)``;
const Container = styled(PageWrapper)`
  ${SubmitButton} {
    align-self: flex-start;
    margin-top: 8px;
  }
`;

export interface InviteFormProps {
  className?: string;
  style?: React.CSSProperties;
}

export const InviteForm = styled(({ ...p }: InviteFormProps) => {
  const { principal } = useCurrentUnion();
  const { canister } = useUnion(principal);
  const nav = useNavigate();
  const submitProps = useUnionMultipleSubmit({
    unionId: principal,
    program: [
      {
        canisterId: principal,
        methodName: 'create_profile',
      },
      {
        canisterId: principal,
        methodName: 'update_access_config',
      },
    ],
    onExecuted: (p, res) => nav(-1),
  });

  const { Form } = useRender<CreateProfileRequest>({
    canisterId: principal,
    type: 'CreateProfileRequest',
  });

  const settings: EditorSettings<CreateProfileRequest> = useMemo(
    () => ({
      rules: {},
      fields: {},
    }),
    [],
  );

  const handleSubmit = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>, payload: CreateProfileRequest) => {
      const { access_config } = await canister.get_access_config({
        id: UNLIMITED_ACCESS_CONFIG_ID,
        query_delegation_proof_opt: [],
      });

      return await submitProps.submit(e, [
        [payload],
        [
          {
            id: UNLIMITED_ACCESS_CONFIG_ID,
            new_allowees: [[...access_config.allowees, { Profile: payload.id }]],
            new_description: [],
            new_name: [],
            new_permissions: [],
          } as UpdateAccessConfigRequest,
        ],
      ]);
    },
    [canister, submitProps],
  );

  return (
    <Container title='Invite new participant' withBack {...p}>
      <Form settings={settings}>
        {(ctx) => (
          <SubmitButton
            disabled={!ctx.isValid || !submitProps.isAllowed}
            onClick={(e) => handleSubmit(e, ctx.getValues() as CreateProfileRequest)}
          >
            Invite
          </SubmitButton>
        )}
      </Form>
    </Container>
  );
})``;
