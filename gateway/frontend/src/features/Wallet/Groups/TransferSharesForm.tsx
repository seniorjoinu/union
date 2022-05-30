import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageWrapper } from '@union/components';
import styled from 'styled-components';
import { TransferGroupSharesRequest } from 'union-ts';
import { Controller } from 'react-hook-form';
import { Principal } from '@dfinity/principal';
import { UnionSubmitButton } from '../../../components/UnionSubmit';
import { useRender, EditorSettings } from '../../IDLRenderer';
import { useCurrentUnion } from '../context';
import { ProfileListField } from '../IDLFields';
import { GroupInfo } from './GroupInfo';

const Container = styled(PageWrapper)``;

export interface TransferSharesFormProps {
  className?: string;
  style?: React.CSSProperties;
}

export const TransferSharesForm = styled(({ ...p }: TransferSharesFormProps) => {
  const { principal } = useCurrentUnion();
  const nav = useNavigate();
  const { groupId } = useParams();

  const { Form } = useRender<TransferGroupSharesRequest>({
    canisterId: principal,
    type: 'TransferGroupSharesRequest',
  });

  const settings: EditorSettings<TransferGroupSharesRequest> = useMemo(
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
        from: {
          order: 2,
          adornment: {
            kind: 'replace',
            render: (ctx, path, name) => (
              <Controller
                name={path as 'from'}
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
        to: {
          order: 3,
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
        qty: { order: 4, label: 'Quantity' },
      },
    }),
    [groupId],
  );

  if (!groupId) {
    return <span>GroupId is empty</span>;
  }

  return (
    <Container title='Transfer group shares' withBack {...p}>
      <Form settings={settings}>
        {(ctx) => (
          <UnionSubmitButton
            style={{ marginTop: 16 }}
            unionId={principal}
            canisterId={principal}
            methodName='transfer_group_shares'
            getPayload={() => [ctx.getValues() as TransferGroupSharesRequest]}
            onExecuted={() => nav(-1)}
            disabled={!ctx.isValid}
          >
            Transfer
          </UnionSubmitButton>
        )}
      </Form>
    </Container>
  );
})``;
