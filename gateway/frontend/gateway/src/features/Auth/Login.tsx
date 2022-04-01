import * as React from 'react';
import styled from 'styled-components';
import { Select as S, Option } from 'components';
import { useAuth, AuthReadyState } from 'services';
import { LoginButton, LoginButtonProps } from './LoginButton';

const Select = styled(S)``;
const Container = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;

  & > ${Select} {
    margin-bottom: 16px;
  }
`;

export interface LoginProps {
  buttonProps?: Partial<LoginButtonProps>;
}

export function Login({ buttonProps, ...p }: LoginProps) {
  const { isAuthentificated, isAuthReady } = useAuth();
  const authorized = isAuthentificated && isAuthReady == AuthReadyState.READY;

  return (
    <Container {...p}>
      <LoginButton {...buttonProps} size='L' variant='outlined' color='white' height={32} />
    </Container>
  );
}
