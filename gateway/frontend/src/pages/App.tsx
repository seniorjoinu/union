import React from 'react';
import styled from 'styled-components';
import { Header } from '../features/Header';

const Content = styled.section`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const Container = styled.main`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;

  ${Content} {
    padding: 32px 64px;
    align-self: center;
    min-width: 700px;
  }
`;

export interface AppProps {
  children: any;
}

export const App = ({ children }: AppProps) => (
  <Container>
    <Header />
    <Content>{children}</Content>
  </Container>
);
