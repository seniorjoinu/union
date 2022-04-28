import React from 'react';
import styled from 'styled-components';
import { LoginButton as LB } from '../components/LoginButton';
import { Feed } from '../components/Feed';
import { Logo } from '../components/atoms';

const LoginButton = styled(LB)``;

const Content = styled.section`
  display: flex;
  flex-direction: column;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;

  ${Content} {
    padding: 64px 0;
    align-self: center;
    min-width: 800px;
    max-width: 800px;
  }

  ${LoginButton} {
    position: fixed;
    top: 16px;
    right: 16px;
    z-index: 1;
  }
  ${Logo} {
    position: fixed;
    top: 16px;
    left: 16px;
    z-index: 1;
  }
`;

export interface AppProps {
  className?: string;
  style?: React.CSSProperties;
}

export const App = ({ ...p }: AppProps) => (
  <Container {...p}>
    <LoginButton />
    <Logo />
    <Content>
      <Feed />
    </Content>
  </Container>
);
