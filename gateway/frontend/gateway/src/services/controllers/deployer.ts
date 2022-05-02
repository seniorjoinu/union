import { authClient, useCanister, Canister, CanisterProps } from 'toolkit';
import { buildSerializer, buildEncoder } from '@union-wallet/serialize';
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

export const deployerSerializer = buildSerializer<_SERVICE>(idl);

export const deployerEncoder = buildEncoder<_SERVICE>(idl);
