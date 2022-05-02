import { authClient, Canister, CanisterProps, useCanister } from 'toolkit';
import { buildSerializer, buildEncoder } from '@union-wallet/serialize';
import { _SERVICE } from 'wallet-ts';
// @ts-expect-error
import { idlFactory as idl } from 'wallet-idl';
import { Principal } from '@dfinity/principal';

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

export const useWallet = (canisterId: Principal) =>
  useCanister(canisterId.toString(), initWalletController);

export const walletSerializer = buildSerializer<_SERVICE>(idl);

export const walletEncoder = buildEncoder<_SERVICE>(idl);
