import React from 'react';
import styled from 'styled-components';
import { Header as H } from '../features/Header';

const Header = styled(H)``;

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

  ${Header} {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 2;
    background: white;
  }

  ${Content} {
    z-index: 1;
    padding: 64px 64px 32px 64px;
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
