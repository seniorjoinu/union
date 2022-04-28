import { Identity } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';
import * as React from 'react';
import { getIdentityUrl } from './agent';

const { createContext, useContext, useEffect, useState } = React;

export interface AuthContext {
  isAuthentificated: boolean;
  isAuthReady: AuthReadyState;
  authClient: AuthClient | null;
  identity: Identity | undefined;
  principal: Principal | undefined;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

export enum AuthReadyState {
  NOT_READY,
  CREATED,
  READY,
}

let authClient: AuthClient | null = null;

export function useProvideAuth(): AuthContext {
  const [isAuthentificated, setIsAuthenticated] = useState<boolean>(false);
  const [identity, setIdentity] = useState<Identity | undefined>();
  const [isAuthClientReady, setAuthClientReady] = useState<AuthReadyState>(
    AuthReadyState.NOT_READY,
  );

  useEffect(() => {
    if (authClient) {
      return;
    }

    AuthClient.create().then((client) => {
      authClient = client;
      setAuthClientReady(AuthReadyState.CREATED);
      return client;
    });
  }, []);

  useEffect(() => {
    if (!authClient) {
      return;
    }
    Promise.all([authClient.getIdentity(), authClient.isAuthenticated()]).then(
      ([identity, isAuthenticated]) => {
        if (!isAuthenticated) {
          logout();
        } else {
          setIdentity(identity);
          setIsAuthenticated(isAuthenticated || false);
        }
        setAuthClientReady(AuthReadyState.READY);
      },
    );
  }, [isAuthClientReady]);

  useEffect(() => {
    if (!authClient) {
      return;
    }

    const identity = authClient.getIdentity();

    if (!identity || identity.getPrincipal().isAnonymous()) {
      return;
    }

    setIdentity(identity);
  }, []);

  const login = async (): Promise<void> => {
    if (!authClient) {
      return;
    }

    await authClient.login({
      identityProvider: getIdentityUrl(),
      maxTimeToLive: BigInt(2 * 60 * 60 * 10 ** 9), // 2 hours
      onSuccess: async () => {
        const identity = await authClient!.getIdentity();

        if (!identity) {
          console.error('Could not get identity from internet identity');
        }

        setIsAuthenticated(true);
        setIdentity(identity);
      },
    });
  };

  async function logout() {
    setIsAuthenticated(false);

    if (!authClient) {
      return;
    }

    await authClient.logout();
    setIdentity(authClient.getIdentity());
  }

  return {
    isAuthentificated,
    isAuthReady: isAuthClientReady,
    identity,
    principal: identity?.getPrincipal(),
    login,
    logout,
    authClient,
  };
}

const authContext = createContext<AuthContext>(null!);

export function ProvideAuth({ children }: any) {
  const auth = useProvideAuth();

  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

export const useAuth = () => useContext(authContext);
