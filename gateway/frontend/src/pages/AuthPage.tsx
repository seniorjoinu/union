import React from 'react';
import { useLocation } from 'react-router-dom';
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
    padding: 24px;
  }
`;

export type AuthPageProps = AuthProps;

export function AuthPage({ to, ...p }: AuthPageProps) {
  const { search } = useLocation();
  const params = new URLSearchParams(search);

  return (
    <Container>
      <Auth {...p} to={params.get('to') || to} />
    </Container>
  );
}
