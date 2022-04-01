import { useState, useMemo } from 'react';
import { authClient, Canister, CanisterProps } from 'toolkit';
import { _SERVICE } from 'gateway-ts';
// @ts-expect-error
import { idlFactory as idl } from 'gateway-idl';

export type IGatewayController = Canister<_SERVICE>;

export const initGatewayController = (canisterId: string, handlers?: CanisterProps['handlers']) => {
  const canister = ((window as any).gateway = new Canister<_SERVICE>({
    canisterId,
    idl,
    handlers,
    agent: authClient.agent,
  }));

  return canister;
};

// Usage
// const { canister, fetching } = useGateway(process.env.GATEWAY_CANISTER_ID);
export const useGateway = (canisterId: string) => {
  const [fetching, setFetching] = useState<{ [key in keyof _SERVICE]?: boolean }>({});
  const [error, setError] = useState<Error | null>(null);

  const canister = useMemo(
    () =>
      initGatewayController(canisterId, {
        onBeforeRequest: (methodName) => {
          setFetching((v) => ({ ...v, [methodName]: true }));
          setError(null);
        },
        onSuccess: (methodName) => {
          setFetching((v) => ({ ...v, [methodName]: false }));
        },
        onError: (methodName, e) => {
          setFetching((v) => ({ ...v, [methodName]: false }));
          setError(e);
        },
      }),
    [setFetching, setError],
  );

  return {
    fetching,
    error,
    canister: canister.canister,
  };
};
