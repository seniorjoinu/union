import React from 'react';
import styled from 'styled-components';
import { Text } from 'components';
import { Redirect } from 'react-router-dom';
import { useAuth } from '../../services';
import { Login } from './Login';

const Container = styled.section`
  position: relative;
  display: flex;
  flex-direction: column;

  & > ${Text} {
    align-self: center;
    margin-bottom: 32px;
  }
`;

export interface AuthProps extends IClassName {
  to: string;
}

export function Auth(p: AuthProps) {
  const { isAuthentificated, authClient } = useAuth();

  return (
    <Container {...p}>
      <Text variant='h3'>{isAuthentificated ? 'Select workspace' : 'Login'}</Text>
      {!isAuthentificated && <Login />}
      {isAuthentificated && authClient.principal && <Redirect to='/instances' />}
    </Container>
  );
}
