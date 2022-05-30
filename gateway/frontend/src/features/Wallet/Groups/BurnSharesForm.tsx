import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageWrapper } from '@union/components';
import styled from 'styled-components';
import { BurnGroupSharesRequest } from 'union-ts';
import { UnionSubmitButton } from '../../../components/UnionSubmit';
import { useRender, EditorSettings } from '../../IDLRenderer';
import { useCurrentUnion } from '../context';
import { GroupInfo } from './GroupInfo';

const Container = styled(PageWrapper)``;

export interface BurnSharesFormProps {
  className?: string;
  style?: React.CSSProperties;
  unaccepted?: boolean;
}

export const BurnSharesForm = styled(({ unaccepted, ...p }: BurnSharesFormProps) => {
  const { principal } = useCurrentUnion();
  const nav = useNavigate();
  const { groupId } = useParams();

  const { Form } = useRender<BurnGroupSharesRequest>({
    canisterId: principal,
    type: 'BurnGroupSharesRequest',
  });

  const settings: EditorSettings<BurnGroupSharesRequest> = useMemo(
    () => ({
      rules: {},
      fields: {
        group_id: {
          order: 1,
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
        owner: { order: 2 },
        qty: { order: 3, label: 'Quantity' },
      },
    }),
    [groupId],
  );

  if (!groupId) {
    return <span>GroupId is empty</span>;
  }

  return (
    <Container title={`Burn ${unaccepted ? 'unaccepted' : ''} group shares`} withBack {...p}>
      <Form settings={settings}>
        {(ctx) => (
          <UnionSubmitButton
            style={{ marginTop: 16 }}
            unionId={principal}
            canisterId={principal}
            methodName={unaccepted ? 'burn_unaccepted_group_shares' : 'burn_group_shares'}
            getPayload={() => [ctx.getValues() as BurnGroupSharesRequest]}
            onExecuted={() => nav(-1)}
            disabled={!ctx.isValid}
          >
            Burn
          </UnionSubmitButton>
        )}
      </Form>
    </Container>
  );
})``;
