import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;

  & > *:not(:last-child) {
    margin-bottom: 8px;
  }
`;

export interface CreateExecutionProps {
  className?: string;
  style?: React.CSSProperties;
}

export const CreateExecution = styled(({ ...p }: CreateExecutionProps) => {
  console.log(p);
  return <Container {...p} />;
})``;
