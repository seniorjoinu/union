import { Principal } from '@dfinity/principal';
import { Column, Text } from '@union/components';
import React, { useMemo } from 'react';
import { get } from 'react-hook-form';
import styled from 'styled-components';
import { Choice, RemoteCallArgs } from 'union-ts';
import { useRender, ViewerSettings } from '../../../IDLRenderer';
import { ArgsInfo } from './ArgsInfo';

const Container = styled(Column)`
  padding-bottom: 8px;
`;

export interface ChoiceItemProps {
  className?: string;
  style?: React.CSSProperties;
  unionId: Principal;
  choice: Choice;
  vote?: [bigint, bigint] | undefined;
  children?: React.ReactNode;
}

export const ChoiceItem = styled(({ unionId, choice, children, vote, ...p }: ChoiceItemProps) => {
  const { View } = useRender<Choice>({
    canisterId: unionId,
    type: 'Choice',
  });

  const settings: ViewerSettings<Choice> = useMemo(
    () => ({
      fields: {
        id: { hide: true },
        voting_id: { hide: true },
        voting_power_by_group: { hide: true },
        name: {
          order: 1,
          adornment: {
            kind: 'replace',
            render: (ctx) => (
              <Text variant='p2' weight='medium'>
                {ctx.value.name}
              </Text>
            ),
          },
        },
        description: {
          order: 2,
          adornment: {
            kind: 'replace',
            render: (ctx) => (
              <Text variant='p3' color='grey'>
                {ctx.value.description}
              </Text>
            ),
          },
        },
        program: {
          order: 3,
          adornment: {
            kind: 'replace',
            render: (ctx, path, name, origin) =>
              ('Empty' in ctx.value.program ? null : <>{origin}</>),
          },
        },
        'program.RemoteCallSequence.-1.args': {
          adornment: {
            kind: 'replace',
            render: (ctx, path, name) => {
              const args = get(ctx.value, path) as RemoteCallArgs;
              const canisterId = get(
                ctx.value,
                path.replace('.args', '.endpoint.canister_id'),
              ) as Principal;
              const methodName = get(
                ctx.value,
                path.replace('.args', '.endpoint.method_name'),
              ) as string;

              return (
                <ArgsInfo
                  args={args}
                  canisterId={canisterId}
                  methodName={methodName}
                  unionId={unionId}
                />
              );
            },
          },
        },
      },
    }),
    [unionId],
  );

  return (
    <Container {...p}>
      <View value={choice} settings={settings} />
      {vote && <Text color='green'>Chosen with {String(vote[1])} shares</Text>}
      {children}
    </Container>
  );
})``;
