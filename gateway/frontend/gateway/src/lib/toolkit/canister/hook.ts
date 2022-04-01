import { useState, useMemo } from 'react';
import { Canister, CanisterProps } from 'toolkit';

export type Unpromise<T extends Promise<any>> = T extends Promise<infer U> ? U : never;

export const useCanister = <T extends {}>(
  canisterId: string,
  initCanister: (canisterId: string, handlers?: CanisterProps['handlers']) => Canister<T>,
) => {
  const [data, setData] = useState<
    {
      // @ts-expect-error
      [key in keyof T]?: Unpromise<ReturnType<T[key]>>;
    }
  >({});
  const [fetching, setFetching] = useState<{ [key in keyof T]?: boolean }>({});
  const [errors, setErrors] = useState<{ [key in keyof T]?: Error | null }>({});

  const canister = useMemo(
    () =>
      initCanister(canisterId, {
        onBeforeRequest: (methodName) => {
          setFetching((v) => ({ ...v, [methodName]: true }));
          setErrors((v) => ({ ...v, [methodName]: null }));
        },
        onSuccess: (methodName, response) => {
          setData((data) => ({ ...data, [methodName]: response }));
          setFetching((v) => ({ ...v, [methodName]: false }));
        },
        onError: (methodName, e) => {
          setFetching((v) => ({ ...v, [methodName]: false }));
          setErrors((v) => ({ ...v, [methodName]: e }));
        },
      }),
    [setFetching, setErrors, canisterId],
  );

  return {
    fetching,
    errors,
    data,
    canister: canister.canister,
  };
};
