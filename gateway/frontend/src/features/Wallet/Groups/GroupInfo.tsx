import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useUnion } from 'services';
import { Spinner, Column, Text } from '@union/components';
import { NavLink } from 'react-router-dom';
import { To } from 'history';
import { useCurrentUnion } from '../context';

const Container = styled(Column)`
  & > ${Text} {
    margin-left: 8px;
    margin-bottom: 2px;

    &:first-child {
      cursor: pointer;
      transition: color 0.2s ease;
      color: ${({ theme }) => theme.colors.dark};

      &:hover {
        color: ${({ theme }) => theme.colors.grey};
      }
    }
  }
`;

export interface GroupInfoProps {
  className?: string;
  style?: React.CSSProperties;
  groupId: bigint;
  to?: To;
}

export const GroupInfo = styled(({ groupId, to, ...p }: GroupInfoProps) => {
  const { principal } = useCurrentUnion();
  const { canister, data, fetching } = useUnion(principal);

  useEffect(() => {
    canister.get_group({ group_id: groupId });
  }, []);

  if (fetching.get_group) {
    return <Spinner size={20} {...p} />;
  }

  const group = data.get_group?.group;

  if (!group) {
    return null;
  }

  return (
    <Container {...p}>
      {to ? (
        <Text variant='p2' as={NavLink} to={to}>
          {`"${group.name}" ${group.private ? 'private ' : ''}group`}
        </Text>
      ) : (
        <Text variant='p2'>{`"${group.name}" ${group.private ? 'private ' : ''}group`}</Text>
      )}
      <Text variant='p3'>{group.description}</Text>
    </Container>
  );
})``;
