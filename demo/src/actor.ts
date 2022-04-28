import { useState, useMemo } from 'react';
import { Actor, ActorConfig, ActorSubclass, CallConfig } from '@dfinity/agent';
import { IDL } from '@dfinity/candid';
import { useAuth } from './auth';
import { getAgent } from './agent';

export type Handlers = {
  onBeforeRequest(methodName: string, args: any[], callConfig: CallConfig): void;
  onSuccess(methodName: string, response: any): void;
  onError(methodName: string, error: Error): void;
};

export const createActor = <T>(
  idl: IDL.InterfaceFactory,
  config: ActorConfig,
  handlers?: Handlers,
): T => {
  const agent = config.agent;
  const canisterId = config.canisterId;

  const caller =
    agent?.getPrincipal().then((caller) => `${caller.toString().slice(0, 12)}...`) ||
    Promise.resolve('none');

  const actor = Actor.createActor<T>(idl, {
    ...config,
    queryTransform: (methodName, args, config) => {
      caller.then((caller) =>
        console.log(`\x1b[92m[query] [${canisterId}] [${caller}] ${methodName}`, ...args),
      );
      handlers?.onBeforeRequest(methodName, args, config);
      return config;
    },
    callTransform: (methodName, args, config) => {
      caller.then((caller) =>
        console.log(`\x1b[35m[update] [${canisterId}] [${caller}] ${methodName}`, ...args),
      );
      handlers?.onBeforeRequest(methodName, args, config);
      return config;
    },
  });

  for (const key in actor) {
    if (Object.prototype.hasOwnProperty.call(actor, key)) {
      const element = actor[key];

      if (typeof element === 'function') {
        // FIXME monkey patching
        // @ts-expect-error
        actor[key] = async (...args: any[]) => {
          let response: any;

          try {
            response = await element.call(actor, ...args);
            console.log(`\x1b[33m[response] [${canisterId}] ${key}`, response, args);
            handlers?.onSuccess(key, response);
          } catch (e) {
            console.log(`\x1b[33m[error_response] [${canisterId}] ${key}`, response, args, e);
            handlers?.onError(key, e as Error);
            throw e;
          }
          return response;
        };
      }
    }
  }

  return actor;
};

export type Unpromise<T extends Promise<any>> = T extends Promise<infer U> ? U : never;

export const useCanister = <T extends {}>(idl: IDL.InterfaceFactory, config: ActorConfig) => {
  const { identity } = useAuth();
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
      createActor<T>(
        idl,
        {
          agent: getAgent({ identity }),
          ...config,
        },
        {
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
        },
      ),
    [identity],
  );

  return {
    fetching,
    errors,
    data,
    canister,
  };
};
