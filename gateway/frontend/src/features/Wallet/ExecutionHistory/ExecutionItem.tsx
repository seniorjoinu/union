import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;

  & > *:not(:last-child) {
    margin-bottom: 8px;
  }
`;

export interface ExecutionItemProps {
  className?: string;
  style?: React.CSSProperties;
  id: bigint;
  opened?: boolean;
}

export const ExecutionItem = styled(({ id, opened, ...p }: ExecutionItemProps) => {
  console.log(p);
  return <Container {...p}>ExecutionItem</Container>;
})``;
