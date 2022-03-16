import React from 'react';
import styled from 'styled-components';
import { Embed, EmbedProps } from '../features/Embed';

const Container = styled.main`
  display: flex;
  flex-direction: column;
  height: 100%;

  & > * {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    height: 700px;
    width: 500px;
    border: 1px solid grey;
    border-radius: 4px;
    padding: 24px;
  }
`;

export interface EmbedPageProps extends EmbedProps {}

export function EmbedPage(p: EmbedPageProps) {
  return (
    <Container>
      <Embed {...p} />
    </Container>
  )
}
