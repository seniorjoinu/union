import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageWrapper } from '@union/components';
import styled from 'styled-components';
import { UpdateAccessConfigRequest } from 'union-ts';
import { useUnion } from 'services';
import { UnionSubmitButton } from '../../../../components/UnionSubmit';
import { useRender } from '../../../IDLRenderer';
import { useCurrentUnion } from '../../context';

const Container = styled(PageWrapper)``;

export interface UpdateAccessConfigFormProps {
  className?: string;
  style?: React.CSSProperties;
}

export const UpdateAccessConfigForm = styled(({ ...p }: UpdateAccessConfigFormProps) => {
  const { principal } = useCurrentUnion();
  const nav = useNavigate();
  const { accessConfigId } = useParams();
  const { canister, fetching, data } = useUnion(principal);

  useEffect(() => {
    if (!accessConfigId) {
      return;
    }

    canister.get_access_config({ id: BigInt(accessConfigId), query_delegation_proof_opt: [] });
  }, [accessConfigId]);

  const defaultValue: UpdateAccessConfigRequest | null = useMemo(() => {
    const accessConfig = data.get_access_config?.access_config;

    if (!accessConfigId || !accessConfig) {
      return null;
    }

    return {
      id: BigInt(accessConfigId),
      new_name: [accessConfig.name],
      new_description: [accessConfig.description],
      new_allowees: [accessConfig.allowees],
      new_permissions: [accessConfig.permissions],
    };
  }, [accessConfigId, data.get_access_config?.access_config]);

  const { Form } = useRender<UpdateAccessConfigRequest>({
    canisterId: principal,
    type: 'UpdateAccessConfigRequest',
  });

  if (!accessConfigId) {
    return <span>accessConfigId is empty</span>;
  }

  if (fetching.get_access_config) {
    return <span>fetching</span>;
  }

  if (!data.get_access_config?.access_config || !defaultValue) {
    return <span>Access config does not found</span>;
  }

  return (
    <Container title='Update access config' withBack {...p}>
      <Form defaultValue={defaultValue}>
        {(ctx) => (
          <UnionSubmitButton
            unionId={principal}
            canisterId={principal}
            methodName='update_access_config'
            getPayload={() => [ctx.getValues() as UpdateAccessConfigRequest]}
            onExecuted={() => nav(-1)}
            disabled={!ctx.formState.isValid}
          >
            Update access config
          </UnionSubmitButton>
        )}
      </Form>
    </Container>
  );
})``;
