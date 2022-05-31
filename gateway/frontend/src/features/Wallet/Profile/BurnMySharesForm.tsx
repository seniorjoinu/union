import React, { useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageWrapper, SubmitButton } from '@union/components';
import styled from 'styled-components';
import { BurnMyGroupSharesRequest } from 'union-ts';
import { useUnion } from 'services';
import { useRender, EditorSettings } from '../../IDLRenderer';
import { useCurrentUnion } from '../context';
import { GroupInfo } from '../Groups';

const Button = styled(SubmitButton)``;
const Container = styled(PageWrapper)`
  ${Button} {
    margin-top: 8px;
    align-self: flex-start;
  }
`;

export interface BurnMySharesFormProps {
  className?: string;
  style?: React.CSSProperties;
}

export const BurnMySharesForm = styled(({ ...p }: BurnMySharesFormProps) => {
  const { principal } = useCurrentUnion();
  const { canister, data } = useUnion(principal);
  const nav = useNavigate();
  const { groupId } = useParams();

  const { Form } = useRender<BurnMyGroupSharesRequest>({
    canisterId: principal,
    type: 'BurnMyGroupSharesRequest',
  });

  const settings: EditorSettings<BurnMyGroupSharesRequest> = useMemo(
    () => ({
      rules: {},
      fields: {
        group_id: {
          order: 1,
          disabled: true,
          defaultValue: typeof groupId !== 'undefined' ? BigInt(groupId) : undefined,
          adornment: {
            kind: 'replace',
            render: (ctx) => {
              const groupId = ctx.getValues().group_id;

              if (typeof groupId != 'bigint') {
                return null;
              }
              return <GroupInfo groupId={groupId} mode='long' />;
            },
          },
        },
        qty: { order: 2, label: 'Quantity' },
      },
    }),
    [groupId],
  );

  const submit = useCallback(
    async (payload: BurnMyGroupSharesRequest) => {
      await canister.burn_my_group_shares(payload);
      nav(-1);
    },
    [canister, nav, data],
  );

  if (!groupId) {
    return <span>GroupId is empty</span>;
  }

  return (
    <Container title='Burn my group shares' withBack {...p}>
      <Form settings={settings}>
        {(ctx) => (
          <Button onClick={() => submit(ctx.getValues())} disabled={!ctx.isValid}>
            Burn
          </Button>
        )}
      </Form>
    </Container>
  );
})``;
