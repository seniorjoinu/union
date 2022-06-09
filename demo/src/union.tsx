import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { UnionClient, ExecuteRequestData } from '@union/client';
import { Principal } from '@dfinity/principal';
import { getAgent } from './agent';
import { _SERVICE, canisterId, backendSerializer } from './backend';
import { AuthReadyState, useAuth } from './auth';

export const unionClient = new UnionClient({});

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

  const execute = useCallback(
    <M extends keyof _SERVICE>(
      methodName: M,
      args: Parameters<_SERVICE[M]>,
      extra?: Partial<ExecuteRequestData & { title: string; description: string }>,
    ) => {
      if (!authorized) {
        throw new Error('Union is not authorized');
      }

      const candidArgs = backendSerializer[methodName](...args);

      // TODO send choices
      return unionClient.execute(
        {
          // title: 'Demo canister operation',
          // description: `Call "${methodName}" in "${canisterId.toString()}" canister`,
          // authorization_delay_nano: BigInt(60 * 60 * 10 ** 9), // 1 hour
          ...extra,
          program: {
            RemoteCallSequence: [
              {
                endpoint: {
                  canister_id: Principal.from(canisterId),
                  method_name: methodName,
                },
                args: { CandidString: candidArgs },
                cycles: BigInt(10 * 6),
              },
            ],
          },
        },
        { after: 'close' },
      );
    },
    [authorized],
  );

  return {
    authorized,
    refresh,
    client: unionClient,
    canister: unionClient.getActor(getAgent()),
    execute,
  };
};
