import React from 'react';
import styled from 'styled-components';
import { Text } from '@union/components';
import { useCurrentUnion } from '../context';

const GroupItem = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.colors.grey};
  padding: 8px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;

  & > *:not(:last-child) {
    margin-bottom: 8px;
  }
`;

export interface GroupsProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Groups = styled(({ ...p }: GroupsProps) => {
  const { groups, fetching } = useCurrentUnion();

  return (
    <Container {...p}>
      <Text variant='h5'>Groups</Text>
      {!!fetching.get_my_groups && <Text>fetching...</Text>}
      {!fetching.get_my_groups && !groups.length && <Text>You are have no groups</Text>}
      {groups.map((g) => (
        <GroupItem key={String(g.id[0])}>
          <Text>id: {String(g.id[0])}</Text>
          <Text>{g.name}</Text>
          <Text>{g.description}</Text>
          <Text>{g.private ? 'Private' : 'Public'}</Text>
          <Text>{String(g.token[0])}</Text>
        </GroupItem>
      ))}
    </Container>
  );
})``;
