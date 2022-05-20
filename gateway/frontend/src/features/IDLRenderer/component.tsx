import { Principal } from '@dfinity/principal';
import React from 'react';
import styled from 'styled-components';
import { useRender, UIProps } from './hook';

const Container = styled.div`
  display: flex;
  flex-direction: column;

  & > *:not(:last-child) {
    margin-bottom: 8px;
  }
`;

export interface IDLRendererProps extends UIProps {
  className?: string;
  style?: React.CSSProperties;
  canisterId: Principal;
  type: string;
}

export const IDLRenderer = styled(({ canisterId, type, selector, ...p }: IDLRendererProps) => {
  const { Editor } = useRender({ canisterId, type });

  return (
    <Container {...p}>
      <Editor selector={selector} />
    </Container>
  );
})``;
