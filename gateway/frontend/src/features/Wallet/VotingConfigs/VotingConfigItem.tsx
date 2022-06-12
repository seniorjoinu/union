import { Accordeon, Column as C, Field } from '@union/components';
import React, { useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';
import { get } from 'react-hook-form';
import { VotingConfig } from 'union-ts';
import { ViewProps, ViewerSettings, defaultFieldProps } from '../../IDLRenderer';
import { PermissionInfo } from '../Permissions';
import { GroupInfo } from '../Groups';
import { computeTime } from '../IDLFields';

const Column = styled(C)`
  border-left: 1px solid ${({ theme }) => theme.colors.grey};
  margin-left: 8px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px 0;

  & > *:not(:last-child) {
    margin-bottom: 8px;
  }

  & > ${Field} {
    ${Field}, ${Column} {
      padding-left: 8px;
    }
  }
`;

export interface VotingConfigItemProps {
  className?: string;
  style?: React.CSSProperties;
  votingConfig: VotingConfig;
  opened?: boolean;
  children?: React.ReactNode;
  View(p: ViewProps<VotingConfig>): JSX.Element;
}

export const VotingConfigItem = styled(
  ({ votingConfig, opened, children, View, ...p }: VotingConfigItemProps) => {
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
      if (!opened || !ref.current) {
        return;
      }
      ref.current.scrollIntoView({ behavior: 'smooth' }); // FIXME shift with header height
    }, []);

    const settings: ViewerSettings<VotingConfig> = useMemo(
      () => ({
        rules: {
          'QuantityOf.quantity': { order: 1 },
          'FractionOf.fraction': { order: 1 },
          'target.Group': {
            adornment: {
              kind: 'replace',
              render: (ctx, path) => {
                const groupId = get(ctx.value, path);

                return (
                  <GroupInfo groupId={groupId} mode='long' to={`../groups/${String(groupId)}`} />
                );
              },
            },
          },
        },
        // @ts-ignore
        fields: {
          id: { hide: true },
          name: { order: 1 },
          description: { order: 2, multiline: true },
          round: { order: 3 },
          winners_count: { order: 4, label: 'Winners limit' },
          choices_count: { order: 5, label: 'Choices limit' },
          permissions: { order: 6 },
          win: { order: 7 },
          rejection: { order: 8 },
          approval: { order: 9 },
          quorum: { order: 10 },
          next_round: { order: 11 },
          'permissions.-1': {
            adornment: {
              kind: 'replace',
              render: (ctx, path) => {
                const permissionId = get(ctx.value, path);

                return (
                  <PermissionInfo
                    permissionId={permissionId}
                    to={`../permissions/${String(permissionId)}`}
                  />
                );
              },
            },
          },
          'round.round_delay': {
            adornment: {
              kind: 'replace',
              render: (ctx, path, name) => {
                const value = get(ctx.value, path);

                return (
                  <Field title={name} {...defaultFieldProps} align='row'>
                    {computeTime(value)}
                  </Field>
                );
              },
            },
          },
          'round.round_duration': {
            adornment: {
              kind: 'replace',
              render: (ctx, path, name) => {
                const value = get(ctx.value, path);

                return (
                  <Field title={name} {...defaultFieldProps} align='row'>
                    {computeTime(value)}
                  </Field>
                );
              },
            },
          },
        },
      }),
      [],
    );

    return (
      <Accordeon title={votingConfig.name} ref={ref} isDefaultOpened={opened} {...p}>
        <Container>
          {children}
          <View value={votingConfig} settings={settings} />
          {/* <Field
            title='Nested voting configs'
            {...defaultFieldProps}
          >
            <NestedVotingConfigs parentVotingConfig={votingConfig.id[0]} />
          </Field> */}
        </Container>
      </Accordeon>
    );
  },
)``;
