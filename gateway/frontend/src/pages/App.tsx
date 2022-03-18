import React from 'react';
import styled from 'styled-components';
import { Header } from '../features/Header';

const Container = styled.main`
  display: flex;
  flex-direction: column;
  height: 100%;

  & > * {
    padding: 16px 24px;
  }
`;

export interface AppProps {
  children: any;
}

export const App = ({ children }: AppProps) => (
  <Container>
    <Header />
    {children}
  </Container>
);
