import { useState, useMemo } from 'react';
import { authClient, Canister, CanisterProps } from 'toolkit';
import { IDL } from '@dfinity/candid';
import { _SERVICE } from 'wallet-ts';
// @ts-expect-error
import { idlFactory as idl } from 'wallet-idl';
import './idl-monkey-patching';

export type IWalletController = Canister<_SERVICE>;

export const initWalletController = (canisterId: string, handlers?: CanisterProps['handlers']) => {
  const canister = ((window as any).wallet = new Canister<_SERVICE>({
    canisterId,
    idl,
    handlers,
    agent: authClient.agent,
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

const idlFactory = idl({ IDL }) as IDL.ServiceClass;

// @ts-expect-error
window.idl = idlFactory;

export const walletSerializer = idlFactory._fields.reduce((acc, next) => {
  const func = next[1] as IDL.FuncClass;

  return {
    ...acc,
    [next[0]]: (...args: any[]) =>
      func.argTypes.map((argType, index) => argType.valueToString(args[index])),
  };
}, {} as { [key in keyof _SERVICE]: (...args: Parameters<_SERVICE[key]>) => string[] });
