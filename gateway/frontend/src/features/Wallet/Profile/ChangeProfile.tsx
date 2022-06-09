import React, { useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper, SubmitButton as SB } from '@union/components';
import styled from 'styled-components';
import { UpdateMyProfileRequest } from 'union-ts';
import { useUnion } from 'services';
import { EditorSettings, useRender } from '../../IDLRenderer';
import { useCurrentUnion } from '../context';

const SubmitButton = styled(SB)``;

const Container = styled(PageWrapper)`
  ${SubmitButton} {
    margin-top: 16px;
    align-self: flex-start;
  }
`;

export interface ChangeProfileProps {
  className?: string;
  style?: React.CSSProperties;
}

export const ChangeProfile = styled(({ ...p }: ChangeProfileProps) => {
  const { principal } = useCurrentUnion();
  const nav = useNavigate();
  const { canister, fetching, data } = useUnion(principal);

  useEffect(() => {
    canister.get_my_profile();
  }, []);

  const defaultValue: UpdateMyProfileRequest | null = useMemo(() => {
    const profile = data.get_my_profile?.profile;

    if (!profile) {
      return null;
    }
    return {
      new_name: [profile.name],
      new_description: [profile.description],
    };
  }, [data.get_my_profile?.profile]);

  const { Form } = useRender<UpdateMyProfileRequest>({
    canisterId: principal,
    type: 'UpdateMyProfileRequest',
  });

  const settings: EditorSettings<UpdateMyProfileRequest> = useMemo(
    () => ({
      rules: {},
      fields: {
        new_name: { order: 1, label: 'Name' },
        new_description: { order: 2, label: 'Description' },
        'new_description.0': { multiline: true },
      },
    }),
    [],
  );

  const submit = useCallback(
    async (payload: UpdateMyProfileRequest) => {
      await canister.update_my_profile(payload);
      nav(-1);
    },
    [canister, nav, data],
  );

  if (fetching.get_my_profile) {
    return <span>fetching</span>;
  }

  if (!data.get_my_profile?.profile || !defaultValue) {
    return <span>Profile does not found</span>;
  }

  return (
    <Container title='Change my profile' withBack {...p}>
      <Form defaultValue={defaultValue} settings={settings}>
        {(ctx) => (
          <SubmitButton disabled={!ctx.isValid} onClick={() => submit(ctx.getValues())}>
            Submit
          </SubmitButton>
        )}
      </Form>
    </Container>
  );
})``;
