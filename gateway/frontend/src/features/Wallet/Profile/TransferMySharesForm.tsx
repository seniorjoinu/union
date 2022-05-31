import React, { useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageWrapper, SubmitButton } from '@union/components';
import styled from 'styled-components';
import { TransferMyGroupSharesRequest } from 'union-ts';
import { useUnion } from 'services';
import { Controller } from 'react-hook-form';
import { Principal } from '@dfinity/principal';
import { useRender, EditorSettings } from '../../IDLRenderer';
import { useCurrentUnion } from '../context';
import { GroupInfo } from '../Groups';
import { ProfileListField } from '../IDLFields';

const Button = styled(SubmitButton)``;
const Container = styled(PageWrapper)`
  ${Button} {
    margin-top: 8px;
    align-self: flex-start;
  }
`;

export interface TransferMySharesFormProps {
  className?: string;
  style?: React.CSSProperties;
}

export const TransferMySharesForm = styled(({ ...p }: TransferMySharesFormProps) => {
  const { principal } = useCurrentUnion();
  const { canister, data } = useUnion(principal);
  const nav = useNavigate();
  const { groupId } = useParams();

  const { Form } = useRender<TransferMyGroupSharesRequest>({
    canisterId: principal,
    type: 'TransferMyGroupSharesRequest',
  });

  const settings: EditorSettings<TransferMyGroupSharesRequest> = useMemo(
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
        to: {
          order: 2,
          adornment: {
            kind: 'replace',
            render: (ctx, path, name) => (
              <Controller
                name={path as 'to'}
                control={ctx.control}
                render={({ field, fieldState: { error } }) => (
                  <ProfileListField
                    label={name}
                    onChange={field.onChange}
                    value={field.value as Principal | null | void}
                    helperText={error?.message}
                  />
                )}
              />
            ),
          },
        },
        qty: { order: 3, label: 'Quantity' },
      },
    }),
    [groupId],
  );

  const submit = useCallback(
    async (payload: TransferMyGroupSharesRequest) => {
      await canister.transfer_my_group_shares(payload);
      nav(-1);
    },
    [canister, nav, data],
  );

  if (!groupId) {
    return <span>GroupId is empty</span>;
  }

  return (
    <Container title='Transfer my group shares' withBack {...p}>
      <Form settings={settings}>
        {(ctx) => (
          <Button
            onClick={() => submit(ctx.getValues() as TransferMyGroupSharesRequest)}
            disabled={!ctx.isValid}
          >
            Transfer
          </Button>
        )}
      </Form>
    </Container>
  );
})``;
