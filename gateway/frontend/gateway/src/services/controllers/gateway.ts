import { authClient, useCanister, Canister, CanisterProps } from 'toolkit';
import { IDL } from '@dfinity/candid';
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

const idlFactory = idl({ IDL }) as IDL.ServiceClass;

export const gatewaySerializer = idlFactory._fields.reduce((acc, next) => {
  const func = next[1] as IDL.FuncClass;

  return {
    ...acc,
    [next[0]]: (...args: any[]) =>
      func.argTypes.map((argType, index) => argType.valueToString(args[index])),
  };
}, {} as { [key in keyof _SERVICE]: (...args: Parameters<_SERVICE[key]>) => string[] });
