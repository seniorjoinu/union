import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useUnion } from 'services';
import { Spinner, Column, Text, Row, Chips, TextVariant } from '@union/components';
import { NavLink } from 'react-router-dom';
import { To } from 'history';
import { caseByCount } from 'toolkit';
import { Group } from 'union-ts';
import { useCurrentUnion } from '../context';

const Children = styled(Column)`
  &:empty {
    display: none;
  }
`;
const Params = styled(Row)`
  align-items: center;

  ${Text}:first-child {
    cursor: pointer;
    transition: color 0.2s ease;
    color: ${({ theme }) => theme.colors.dark};

    &:hover {
      color: ${({ theme }) => theme.colors.grey};
    }
  }
`;

const Container = styled(Column)`
  ${Params} {
    margin-bottom: 2px;
  }
  ${Children} {
    margin-bottom: 8px;
  }
  & > ${Text} {
    color: ${({ theme }) => theme.colors.grey};
  }
`;

export interface GroupInfoProps {
  className?: string;
  style?: React.CSSProperties;
  shares?: bigint;
  to?: To;
  mode?: 'short' | 'long';
  verbose?: { shares?: React.ReactNode };
  variant?: TextVariant;
  chips?: React.ReactNode[];
  children?: React.ReactNode;
}

type GroupId =
  | {
      groupId: bigint;
      group?: never;
    }
  | {
      groupId?: never;
      group: Group;
    };

export const GroupInfo = styled(
  ({
    groupId,
    group: propGroup,
    to,
    shares,
    mode = 'short',
    variant = 'p3',
    chips = [],
    verbose,
    children,
    ...p
  }: GroupInfoProps & GroupId) => {
    const { principal } = useCurrentUnion();
    const { canister, data, fetching } = useUnion(principal);

    useEffect(() => {
      if (typeof groupId == 'bigint') {
        canister.get_group({ group_id: groupId, query_delegation_proof_opt: [] });
      }
    }, []);

    if (fetching.get_group) {
      return <Spinner size={20} {...p} />;
    }

    const group = propGroup || data.get_group?.group;

    if (!group) {
      return (
        <Container {...p}>
          <Text variant={variant}>Unknown group</Text>
        </Container>
      );
    }

    return (
      <Container {...p}>
        <Params>
          <Text variant={variant} as={to ? NavLink : undefined} to={to!}>
            {group.name}
          </Text>
          {mode == 'long' && (
            <Chips variant='caption' weight='medium'>
              {group.private ? 'private' : 'public'}
            </Chips>
          )}
          {typeof shares !== 'undefined' && (
            <Chips variant='caption' weight='medium'>
              {verbose?.shares ? `${verbose.shares} ` : ''}
              {String(shares)}{' '}
              {caseByCount(parseInt(String(shares)), ['share', 'shares', 'shares'])}
            </Chips>
          )}
          {chips.map((content, i) => (
            <Chips variant='caption' weight='medium' key={String(i)}>
              {content}
            </Chips>
          ))}
        </Params>
        {mode == 'long' && <Text variant='p3'>{group.description}</Text>}
        <Children>{children}</Children>
      </Container>
    );
  },
)``;
