import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageWrapper } from '@union/components';
import styled from 'styled-components';
import { MintGroupSharesRequest } from 'union-ts';
import { UnionSubmitButton } from '../../../components/UnionSubmit';
import { useRender, EditorSettings } from '../../IDLRenderer';
import { useCurrentUnion } from '../context';
import { GroupInfo } from './GroupInfo';

const Container = styled(PageWrapper)``;

export interface MintSharesFormProps {
  className?: string;
  style?: React.CSSProperties;
}

export const MintSharesForm = styled(({ ...p }: MintSharesFormProps) => {
  const { principal } = useCurrentUnion();
  const nav = useNavigate();
  const { groupId } = useParams();

  const { Form } = useRender<MintGroupSharesRequest>({
    canisterId: principal,
    type: 'MintGroupSharesRequest',
  });

  const settings: EditorSettings<MintGroupSharesRequest> = useMemo(
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
    <Container title='Mint group shares' withBack {...p}>
      <Form settings={settings}>
        {(ctx) => (
          <UnionSubmitButton
            style={{ marginTop: 16 }}
            unionId={principal}
            canisterId={principal}
            methodName='mint_group_shares'
            getPayload={() => [ctx.getValues() as MintGroupSharesRequest]}
            onExecuted={() => nav(-1)}
            disabled={!ctx.isValid}
          >
            Mint
          </UnionSubmitButton>
        )}
      </Form>
    </Container>
  );
})``;
