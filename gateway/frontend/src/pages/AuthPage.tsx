import React from 'react';
import styled from 'styled-components';
import { Auth, AuthProps } from '../features/Auth';

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

export type AuthPageProps = AuthProps;

export function AuthPage(p: AuthPageProps) {
  return (
    <Container>
      <Auth {...p} />
    </Container>
  );
}
