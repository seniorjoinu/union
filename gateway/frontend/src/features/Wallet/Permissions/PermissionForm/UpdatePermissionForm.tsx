import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageWrapper } from '@union/components';
import styled from 'styled-components';
import { UpdatePermissionRequest } from 'union-ts';
import { useUnion } from 'services';
import { UnionSubmitButton } from '../../../../components/UnionSubmit';
import { useRender } from '../../../IDLRenderer';
import { useCurrentUnion } from '../../context';

const Container = styled(PageWrapper)``;

export interface UpdatePermissionFormProps {
  className?: string;
  style?: React.CSSProperties;
}

export const UpdatePermissionForm = styled(({ ...p }: UpdatePermissionFormProps) => {
  const { principal } = useCurrentUnion();
  const nav = useNavigate();
  const { permissionId } = useParams();
  const { canister, fetching, data } = useUnion(principal);

  useEffect(() => {
    if (!permissionId) {
      return;
    }

    canister.get_permission({ id: BigInt(permissionId), query_delegation_proof_opt: [] });
  }, [permissionId]);

  const defaultValue: UpdatePermissionRequest | null = useMemo(() => {
    const permission = data.get_permission?.permission;

    if (!permissionId || !permission) {
      return null;
    }

    return {
      id: BigInt(permissionId),
      new_name: [permission.name],
      new_description: [permission.description],
      new_targets: [permission.targets],
    };
  }, [permissionId, data.get_permission?.permission]);

  const { Form } = useRender<UpdatePermissionRequest>({
    canisterId: principal,
    type: 'UpdatePermissionRequest',
  });

  if (!permissionId) {
    return <span>PermissionId is empty</span>;
  }

  if (fetching.get_permission) {
    return <span>fetching</span>;
  }

  if (!data.get_permission?.permission || !defaultValue) {
    return <span>Permission does not found</span>;
  }

  return (
    <Container title='Update permission' withBack {...p}>
      <Form defaultValue={defaultValue}>
        {(ctx) => (
          <UnionSubmitButton
            unionId={principal}
            canisterId={principal}
            methodName='update_permission'
            getPayload={() => [ctx.getValues() as UpdatePermissionRequest]}
            onExecuted={() => nav(-1)}
            disabled={!ctx.formState.isValid}
          >
            Update permission
          </UnionSubmitButton>
        )}
      </Form>
    </Container>
  );
})``;
