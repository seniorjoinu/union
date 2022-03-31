import React from 'react';
import styled from 'styled-components';
import { Header as H } from '../features/Header';

const Header = styled(H)``;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  width: 100%;
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

  ${Section} {
    display: flex;
    flex-direction: column;
    padding: 64px 128px 32px 128px;
    z-index: 1;

    & > * {
      height: 100%;
      min-width: 700px;
      align-self: center;
    }
  }
`;

export interface AppProps {
  children: any;
}

export const App = ({ children }: AppProps) => (
  <Container>
    <Header />
    <Section>{children}</Section>
  </Container>
);
