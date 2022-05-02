import { _SERVICE } from 'backend-ts';
// @ts-expect-error
import { idlFactory as idl } from 'backend-idl';
import { useCanister } from './useCanister';
import { IDL } from '@dfinity/candid';

export type { _SERVICE } from 'backend-ts';

export const useBackend = () => {
  const canisterId = process.env.FEED_APP_CANISTER_ID!;

  return useCanister<_SERVICE>(idl, { canisterId });
};

const idlFactory = idl({ IDL }) as IDL.ServiceClass;

export const backendSerializer = idlFactory._fields.reduce((acc, next) => {
  const func = next[1] as IDL.FuncClass;

  return {
    ...acc,
    [next[0]]: (...args: any[]) =>
      func.argTypes.map((argType, index) => argType.valueToString(args[index])),
  };
}, {} as { [key in keyof _SERVICE]: (...args: Parameters<_SERVICE[key]>) => string[] });
