import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageWrapper } from '@union/components';
import styled from 'styled-components';
import { UpdateGroupRequest } from 'union-ts';
import { useUnion } from 'services';
import { UnionSubmitButton } from '../../../../components/UnionSubmit';
import { Settings, useRender } from '../../../IDLRenderer';
import { useCurrentUnion } from '../../context';

const Container = styled(PageWrapper)``;

export interface UpdateGroupFormProps {
  className?: string;
  style?: React.CSSProperties;
}

export const UpdateGroupForm = styled(({ ...p }: UpdateGroupFormProps) => {
  const { principal } = useCurrentUnion();
  const nav = useNavigate();
  const { groupId } = useParams();
  const { canister, fetching, data } = useUnion(principal);

  useEffect(() => {
    if (!groupId) {
      return;
    }

    canister.get_group({ group_id: BigInt(groupId), query_delegation_proof_opt: [] });
  }, [groupId]);

  const defaultValue: UpdateGroupRequest | null = useMemo(() => {
    const group = data.get_group?.group;

    if (!groupId || !group) {
      return null;
    }

    return {
      group_id: BigInt(groupId),
      new_name: [group.name],
      new_description: [group.description],
    };
  }, [groupId, data.get_group?.group]);

  const { Form } = useRender<UpdateGroupRequest>({
    canisterId: principal,
    type: 'UpdateGroupRequest',
  });

  const settings: Settings<UpdateGroupRequest> = useMemo(
    () => ({
      rules: {},
      fields: {
        new_name: { order: 1 },
        new_description: { order: 2 },
        group_id: { hide: true },
      },
    }),
    [],
  );

  if (!groupId) {
    return <span>GroupId is empty</span>;
  }

  if (fetching.get_group) {
    return <span>fetching</span>;
  }

  if (!data.get_group?.group || !defaultValue) {
    return <span>Group does not found</span>;
  }

  return (
    <Container title='Update group' withBack {...p}>
      <Form
        defaultValue={defaultValue}
        settings={settings}
        transformLabel={(v, tr) => tr(v?.replace('new_', ''))}
      >
        {(ctx) => (
          <UnionSubmitButton
            unionId={principal}
            canisterId={principal}
            methodName='update_group'
            getPayload={() => [ctx.getValues() as UpdateGroupRequest]}
            onExecuted={() => nav(-1)}
            disabled={!ctx.isValid}
          >
            Update group
          </UnionSubmitButton>
        )}
      </Form>
    </Container>
  );
})``;
