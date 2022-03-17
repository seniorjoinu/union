import React from 'react';
import styled from 'styled-components';
import { useRouteMatch } from 'react-router-dom';
import { checkPrincipal } from 'toolkit';
import { Text as T } from 'components';
import { Login as L } from '../Auth/Login';
import { useAuth, AuthReadyState } from '../../services/auth';

const Text = styled(T)``;
const Login = styled(L)``;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px;

  ${Login} {
    margin-bottom: 32px;
  }

  ${Text} {
    align-self: center;
    margin-bottom: 16px;
  }
`;

export interface EmbedProps {
  canisterId?: string;
  query?: string;
}

export function Embed({ canisterId, query }: EmbedProps) {
  const { isAuthReady, isAuthentificated } = useAuth();
  const { path } = useRouteMatch();

  const authorized = isAuthReady == AuthReadyState.READY && isAuthentificated;

  if (!canisterId || !checkPrincipal(canisterId)) {
    throw new Error(`Wrong principal "${canisterId}"`);
  }

  let decodedQuery = {};

  if (query) {
    try {
      decodedQuery = JSON.parse(unescape(query));
    } catch (e) {
      console.error(`Unable to decode query "${query}"`, query);
    }
  }

  console.log(decodedQuery);
  // TODO send ready message to opener

  return (
    <Container>
      <Text variant='h3'>MIDHUB</Text>
      <Login buttonProps={{ backUrl: path }} />
      {authorized && <Text>Successfull opened</Text>}
    </Container>
  );
}
