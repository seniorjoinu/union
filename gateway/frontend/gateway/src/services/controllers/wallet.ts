import { useState, useMemo } from 'react';
import { authClient, Canister, CanisterProps, useCanister } from 'toolkit';
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

export const useWallet = (canisterId: string) => useCanister(canisterId, initWalletController);

const idlFactory = idl({ IDL }) as IDL.ServiceClass;

export const walletSerializer = idlFactory._fields.reduce((acc, next) => {
  const func = next[1] as IDL.FuncClass;

  return {
    ...acc,
    [next[0]]: (...args: any[]) =>
      func.argTypes.map((argType, index) => argType.valueToString(args[index])),
  };
}, {} as { [key in keyof _SERVICE]: (...args: Parameters<_SERVICE[key]>) => string[] });
