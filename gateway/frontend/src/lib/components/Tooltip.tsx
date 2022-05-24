import React from 'react';
import styled from 'styled-components';
import { withBorder } from './withBorder';

const BordererdDiv = withBorder(styled.div``);
const Container = styled.div``;

export const Tooltip = styled(({ children, ...p }: React.HTMLAttributes<HTMLDivElement>) => (
  <Container {...p}>
    <BordererdDiv>{children}</BordererdDiv>
  </Container>
))`
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;
  position: absolute;
  top: 100%;
  left: 50%;
  z-index: 5;
  transform: translate(-50%, 0);
  padding: 6px 4px 4px;

  & > div {
    display: flex;
    flex-direction: column;
    padding: 8px;
    background-color: white;
  }
`;
