import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '@union/components';
import styled from 'styled-components';
import { UpdateSettingsRequest } from 'union-ts';
import { useUnion } from 'services';
import { UnionSubmitButton } from '../../../components/UnionSubmit';
import { EditorSettings, useRender } from '../../IDLRenderer';
import { useCurrentUnion } from '../context';

const Container = styled(PageWrapper)``;

export interface UpdateInfoFormProps {
  className?: string;
  style?: React.CSSProperties;
}

export const UpdateInfoForm = styled(({ ...p }: UpdateInfoFormProps) => {
  const { principal } = useCurrentUnion();
  const nav = useNavigate();
  const { canister, fetching, data } = useUnion(principal);

  useEffect(() => {
    canister.get_settings({ query_delegation_proof_opt: [] });
  }, []);

  const defaultValue: UpdateSettingsRequest | null = useMemo(() => {
    const settings = data.get_settings?.settings;

    if (!settings) {
      return { new_name: [], new_description: [] };
    }
    return {
      new_name: [settings.name],
      new_description: [settings.description],
    };
  }, [data.get_settings?.settings]);

  const { Form } = useRender<UpdateSettingsRequest>({
    canisterId: principal,
    type: 'UpdateSettingsRequest',
  });

  const settings: EditorSettings<UpdateSettingsRequest> = useMemo(
    () => ({
      rules: {},
      fields: {
        new_name: { order: 1, label: 'Name' },
        new_description: { order: 2, label: 'Description' },
      },
    }),
    [],
  );

  if (fetching.get_settings) {
    return <span>fetching</span>;
  }

  if (!data.get_settings?.settings || !defaultValue) {
    return <span>Settings does not found</span>;
  }

  return (
    <Container title='Update union info' withBack {...p}>
      <Form defaultValue={defaultValue} settings={settings}>
        {(ctx) => (
          <UnionSubmitButton
            unionId={principal}
            canisterId={principal}
            methodName='update_settings'
            getPayload={() => [ctx.getValues() as UpdateSettingsRequest]}
            onExecuted={() => nav(-1)}
            disabled={!ctx.isValid}
          >
            Update info
          </UnionSubmitButton>
        )}
      </Form>
    </Container>
  );
})``;
