import { useState, useMemo } from 'react';
import { AuthCanisterController, AuthCanisterControllerProps } from 'toolkit';
import { _SERVICE } from 'wallet-ts';
// @ts-expect-error
import { idlFactory as idl } from 'wallet-idl';

export type IWalletController = AuthCanisterController<_SERVICE>;

export const initWalletController = (
  canisterId: string,
  handlers?: AuthCanisterControllerProps['handlers'],
) => {
  const canister = ((window as any).wallet = new AuthCanisterController<_SERVICE>({
    canisterId,
    idl,
    context: { name: 'wallet' },
    handlers,
  }));

  return canister;
};

type Unpromise<T extends Promise<any>> = T extends Promise<infer U> ? U : never;
export type Fetching = { [key in keyof _SERVICE]?: boolean };

export const useWallet = (canisterId: string) => {
  const [data, setData] = useState<
    {
      [key in keyof _SERVICE]?: Unpromise<ReturnType<_SERVICE[key]>>;
    }
  >({});
  const [fetching, setFetching] = useState<Fetching>({});
  const [error, setError] = useState<Error | null>(null);

  const canister = useMemo(
    () =>
      initWalletController(canisterId, {
        onBeforeRequest: (methodName) => {
          setFetching((v) => ({ ...v, [methodName]: true }));
          setError(null);
        },
        onSuccess: (methodName, response) => {
          setData((data) => ({ ...data, [methodName]: response }));
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
    data,
    canister: canister.canister,
  };
};