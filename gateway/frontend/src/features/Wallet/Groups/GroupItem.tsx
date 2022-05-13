import { Text } from '@union/components';
import React from 'react';
import styled from 'styled-components';
import { Group } from 'union-ts';

const Container = styled.div`
  display: flex;
  flex-direction: column;

  & > *:not(:last-child) {
    margin-bottom: 8px;
  }
`;

export interface GroupItemProps {
  className?: string;
  style?: React.CSSProperties;
  group: Group;
}

export const GroupItem = styled(({ group, ...p }: GroupItemProps) => {
  console.log(p);
  return (
    <Container {...p}>
      <Text>{group.name}</Text>
      <Text>{group.description}</Text>
    </Container>
  );
})``;
