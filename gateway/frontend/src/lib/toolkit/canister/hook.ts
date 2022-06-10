import { useState, useMemo } from 'react';
import { Canister, CanisterProps } from 'toolkit';

export type Unpromise<T extends Promise<any>> = T extends Promise<infer U> ? U : never;

export const useCanister = <T extends {}>(
  canisterId: string,
  initCanister: (canisterId: string, handlers?: CanisterProps['handlers']) => Canister<T>,
  options?: { poll: { methods: (keyof T)[]; timeout?: number } },
) => {
  const [data, setData] = useState<
    {
      // @ts-expect-error
      [key in keyof T]?: Unpromise<ReturnType<T[key]>>;
    }
  >({});
  const [fetching, setFetching] = useState<{ [key in keyof T]?: boolean }>({});
  const [errors, setErrors] = useState<{ [key in keyof T]?: Error | null }>({});
  // const [args, setArgs] = useState<{ [key in keyof T]?: any[] }>({});

  const canister = useMemo(
    () =>
      initCanister(canisterId, {
        onBeforeRequest: (methodName, a) => {
          // if (options?.poll.methods.includes(methodName as keyof T) && !args[methodName as keyof T]) {
          //   setArgs(({...args, [methodName as keyof T]: a}));
          // }
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
    [
      setFetching,
      setErrors,
      canisterId,
      options,
      // setArgs, args
    ],
  );

  // useEffect(() => {
  //   if (!options || !options.poll.methods.length) {
  //     return;
  //   }

  //   const fired = options.poll.methods.filter(m => !!data[m]);
  //   if (!fired.length) {
  //     return;
  //   }

  //   const interval = window.setInterval(() => {
  //     fired.map(m => {
  //       const methodArgs = args[m];
  //       if (!methodArgs) {
  //         return;
  //       }
  //       // @ts-expect-error
  //       canister.canister[m](...methodArgs);
  //     });
  //   }, options.poll.timeout || 3000);

  //   return () => window.clearInterval(interval)
  // }, [canister, data, args]);

  return {
    fetching,
    errors,
    data,
    canister: canister.canister,
  };
};
