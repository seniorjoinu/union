import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { UnionWalletClient, ExecuteRequestData } from '@union-wallet/client';
import { Principal } from '@dfinity/principal';
import { getAgent } from './agent';
import { _SERVICE, canisterId, backendSerializer } from './backend';
import { AuthReadyState, useAuth } from './auth';

export const unionWalletClient = new UnionWalletClient({});

export const context = createContext({
  authorized: false,
  setAuthorized: (_: boolean) => {},
});

export const UnionWalletProvider = ({ children }: { children: any }) => {
  const [authorized, setAuthorized] = useState(false);
  const { isAuthReady, isAuthentificated } = useAuth();

  const value = {
    authorized,
    setAuthorized,
  };

  useEffect(() => {
    setAuthorized(unionWalletClient.isAuthorized());
  }, []);

  useEffect(() => {
    if (isAuthReady != AuthReadyState.READY || isAuthentificated) {
      return;
    }

    unionWalletClient.logout();
    setAuthorized(unionWalletClient.isAuthorized());
  }, [isAuthReady, isAuthentificated]);

  return <context.Provider value={value}>{children}</context.Provider>;
};

export const useUnionWallet = () => {
  const { authorized, setAuthorized } = useContext(context);

  const refresh = useCallback(() => {
    setAuthorized(unionWalletClient.isAuthorized());
  }, [setAuthorized]);

  const execute = useCallback(
    <M extends keyof _SERVICE>(
      methodName: M,
      args: Parameters<_SERVICE[M]>,
      extra?: Partial<
        Pick<ExecuteRequestData, 'title' | 'description' | 'authorization_delay_nano' | 'rnp'>
      >,
    ) => {
      if (!authorized) {
        throw new Error('Union is not authorized');
      }

      const candidArgs = backendSerializer[methodName](...args);

      return unionWalletClient.execute(
        {
          title: 'Demo canister operation',
          description: `Call "${methodName}" in "${canisterId.toString()}" canister`,
          authorization_delay_nano: BigInt(60 * 60 * 10 ** 9), // 1 hour
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
    client: unionWalletClient,
    canister: unionWalletClient.getWalletActor(getAgent()),
    execute,
  };
};
