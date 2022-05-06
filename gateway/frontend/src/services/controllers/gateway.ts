import { authClient, useCanister, Canister, CanisterProps } from 'toolkit';
import { buildSerializer } from '@union/serialize';
import { _SERVICE } from 'gateway-ts';
// @ts-expect-error
import { idlFactory as idl } from 'gateway-idl';

export type IGatewayController = Canister<_SERVICE>;

export const initGatewayController = (canisterId: string, handlers?: CanisterProps['handlers']) => {
  const canister = ((window as any).gateway = new Canister<_SERVICE>({
    canisterId,
    idl,
    handlers,
    agent: authClient.agent,
  }));

  return canister;
};

// Usage
// const { canister, fetching } = useGateway(process.env.GATEWAY_CANISTER_ID);
export const useGateway = (canisterId: string) => useCanister(canisterId, initGatewayController);

export const gatewaySerializer = buildSerializer<_SERVICE>(idl);
