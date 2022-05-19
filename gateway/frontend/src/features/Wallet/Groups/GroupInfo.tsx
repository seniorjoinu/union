import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useUnion } from 'services';
import { Spinner, Column, Text, Row, Chips } from '@union/components';
import { NavLink } from 'react-router-dom';
import { To } from 'history';
import { caseByCount } from 'toolkit';
import { useCurrentUnion } from '../context';

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
  & > ${Text} {
    color: ${({ theme }) => theme.colors.grey};
  }
`;

export interface GroupInfoProps {
  className?: string;
  style?: React.CSSProperties;
  groupId: bigint;
  minShares?: bigint;
  to?: To;
  mode?: 'short' | 'long';
}

export const GroupInfo = styled(
  ({ groupId, to, minShares, mode = 'short', ...p }: GroupInfoProps) => {
    const { principal } = useCurrentUnion();
    const { canister, data, fetching } = useUnion(principal);

    useEffect(() => {
      canister.get_group({ group_id: groupId, query_delegation_proof_opt: [] });
    }, []);

    if (fetching.get_group) {
      return <Spinner size={20} {...p} />;
    }

    const group = data.get_group?.group;

    if (!group) {
      return (
        <Container {...p}>
          <Text variant='p2'>Unknown group</Text>
        </Container>
      );
    }

    return (
      <Container {...p}>
        <Params>
          <Text variant='p2' as={to ? NavLink : undefined} to={to!}>
            {group.name}
          </Text>
          {mode == 'long' && (
            <Chips variant='caption' weight='medium'>
              {group.private ? 'private' : 'public'}
            </Chips>
          )}
          {typeof minShares !== 'undefined' && (
            <Chips variant='caption' weight='medium'>
              min {String(minShares)}{' '}
              {caseByCount(parseInt(String(minShares)), ['share', 'shares', 'shares'])}
            </Chips>
          )}
        </Params>
        {mode == 'long' && <Text variant='p3'>{group.description}</Text>}
      </Container>
    );
  },
)``;
