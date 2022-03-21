import { useState, useMemo } from 'react';
import { AuthCanisterController, AuthCanisterControllerProps } from 'toolkit';
import { _SERVICE } from 'deployer-ts';
// @ts-expect-error
import { idlFactory as idl } from 'deployer-idl';

export type IDeployerController = AuthCanisterController<_SERVICE>;

export const initDeployerController = (
  canisterId: string,
  handlers?: AuthCanisterControllerProps['handlers'],
) => {
  const canister = ((window as any).deployer = new AuthCanisterController<_SERVICE>({
    canisterId,
    idl,
    context: { name: 'wallet' },
    handlers,
  }));

  return canister;
};

export const useDeployer = (canisterId: string) => {
  const [fetching, setFetching] = useState<{ [key in keyof _SERVICE]?: boolean }>({});
  const [error, setError] = useState<Error | null>(null);

  const canister = useMemo(
    () =>
      initDeployerController(canisterId, {
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
