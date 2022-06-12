import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { UnionClient } from '@union/client';
import { Principal } from '@dfinity/principal';
import { getAgent } from './agent';
import { _SERVICE, canisterId, backendEncoder } from './backend';
import { AuthReadyState, useAuth } from './auth';

export const unionClient = new UnionClient({
  providerUrl: 'http://localhost:3000',
});

export const context = createContext({
  authorized: false,
  setAuthorized: (_: boolean) => {},
});

export const UnionProvider = ({ children }: { children: any }) => {
  const [authorized, setAuthorized] = useState(false);
  const { isAuthReady, isAuthentificated } = useAuth();

  const value = {
    authorized,
    setAuthorized,
  };

  useEffect(() => {
    setAuthorized(unionClient.isAuthorized());
  }, []);

  useEffect(() => {
    if (isAuthReady != AuthReadyState.READY || isAuthentificated) {
      return;
    }

    unionClient.logout();
    setAuthorized(unionClient.isAuthorized());
  }, [isAuthReady, isAuthentificated]);

  return <context.Provider value={value}>{children}</context.Provider>;
};

export const useUnion = () => {
  const { authorized, setAuthorized } = useContext(context);

  const refresh = useCallback(() => {
    setAuthorized(unionClient.isAuthorized());
  }, [setAuthorized]);

  const getProgram = useCallback(
    <M extends keyof _SERVICE>(data: [M, Parameters<_SERVICE[M]>][]) => {
      if (!authorized) {
        throw new Error('Union is not authorized');
      }

      return {
        RemoteCallSequence: data.map(([methodName, args]) => {
          const buffer = backendEncoder[methodName](...args);

          // console.log('BUFFA', Array.from(new Uint8Array(buffer)));

          return {
            endpoint: {
              canister_id: Principal.from(canisterId),
              method_name: methodName,
            },
            args: { Encoded: Array.from(new Uint8Array(buffer)) },
            cycles: BigInt(0),
          };
        }),
      };
    },
    [authorized],
  );

  return {
    authorized,
    refresh,
    client: unionClient,
    canister: unionClient.getActor(getAgent()),
    getProgram,
  };
};
