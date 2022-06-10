import { authClient, useCanister, Canister, CanisterProps } from 'toolkit';
import { buildSerializer, buildEncoder } from '@union/serialize';
import { _SERVICE } from 'ledger-ts';
// @ts-expect-error
import { idlFactory as idl } from 'ledger-idl';
import { IDL } from '@dfinity/candid';
import { Principal } from '@dfinity/principal';

export type IHistoryLedgerController = Canister<_SERVICE>;
export type HistoryLedgerService = _SERVICE;

export const historyLedgerIdl = idl as IDL.InterfaceFactory;

export const initHistoryLedgerController = (
  canisterId: string,
  handlers?: CanisterProps['handlers'],
) => {
  const canister = ((window as any).history_ledger = new Canister<_SERVICE>({
    canisterId,
    idl,
    handlers,
    agent: authClient.agent,
  }));

  return canister;
};

export const useHistoryLedger = (canisterId: Principal) =>
  useCanister(canisterId.toString(), initHistoryLedgerController);

export const historyLedgerSerializer = buildSerializer<_SERVICE>(idl);

export const historyLedgerEncoder = buildEncoder<_SERVICE>(idl);
