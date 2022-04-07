import { authClient, useCanister, Canister, CanisterProps } from 'toolkit';
import { IDL } from '@dfinity/candid';
import { _SERVICE } from 'deployer-ts';
// @ts-expect-error
import { idlFactory as idl } from 'deployer-idl';

export type IDeployerController = Canister<_SERVICE>;

export const initDeployerController = (
  canisterId: string,
  handlers?: CanisterProps['handlers'],
) => {
  const canister = ((window as any).deployer = new Canister<_SERVICE>({
    canisterId,
    idl,
    handlers,
    agent: authClient.agent,
  }));

  return canister;
};

export const useDeployer = (canisterId: string) => useCanister(canisterId, initDeployerController);

const idlFactory = idl({ IDL }) as IDL.ServiceClass;

export const deployerSerializer = idlFactory._fields.reduce((acc, next) => {
  const func = next[1] as IDL.FuncClass;

  return {
    ...acc,
    [next[0]]: (...args: any[]) =>
      func.argTypes.map((argType, index) => argType.valueToString(args[index])),
  };
}, {} as { [key in keyof _SERVICE]: (...args: Parameters<_SERVICE[key]>) => string[] });

export const deployerEncoder = idlFactory._fields.reduce((acc, next) => {
  const func = next[1] as IDL.FuncClass;

  return {
    ...acc,
    [next[0]]: (...args: any[]) => IDL.encode(func.argTypes, args),
  };
}, {} as { [key in keyof _SERVICE]: (...args: Parameters<_SERVICE[key]>) => ArrayBuffer });
