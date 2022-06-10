import { Accordeon, Column as C, Field } from '@union/components';
import React, { useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';
import { get } from 'react-hook-form';
import { NestedVotingConfig } from 'union-ts';
import { ViewProps, ViewerSettings } from '../../../IDLRenderer';
import { GroupInfo } from '../../Groups';
import { VotingConfigInfo } from '../VotingConfigInfo';

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

export interface NestedVotingConfigItemProps {
  className?: string;
  style?: React.CSSProperties;
  votingConfig: NestedVotingConfig;
  opened?: boolean;
  children?: React.ReactNode;
  endAdornment?: React.ReactNode;
  View(p: ViewProps<NestedVotingConfig>): JSX.Element;
}

export const NestedVotingConfigItem = styled(
  ({ votingConfig, opened, children, View, endAdornment, ...p }: NestedVotingConfigItemProps) => {
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
      if (!opened || !ref.current) {
        return;
      }
      ref.current.scrollIntoView({ behavior: 'smooth' }); // FIXME shift with header height
    }, []);

    const settings: ViewerSettings<NestedVotingConfig> = useMemo(
      () => ({
        fields: {
          id: { hide: true },
          name: { order: 1 },
          description: { order: 2, multiline: true },
          remote_union_id: { order: 3 },
          vote_calculation: { order: 4 },
          allowee_groups: { order: 5 },
          remote_voting_config_id: {
            order: 6,
            adornment: {
              kind: 'replace',
              render: (ctx, path) => (
                <Field title='Parent config' weight={{ title: 'medium' }} variant={{ title: 'p3' }}>
                  <VotingConfigInfo
                    votingConfigId={get(ctx.value, path)?.Common}
                    nestedVotingConfigId={get(ctx.value, path)?.Nested}
                  />
                </Field>
              ),
            },
          },
          'allowee_groups.-1.0': {
            label: 'Group id',
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
          'allowee_groups.-1.1': {
            label: 'Fraction',
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
          {endAdornment}
        </Container>
      </Accordeon>
    );
  },
)``;
