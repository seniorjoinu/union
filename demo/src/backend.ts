import { _SERVICE } from 'backend-ts';
// @ts-expect-error
import { idlFactory as idl } from 'backend-idl';
import { buildSerializer } from '@union-wallet/serialize';
import { useCanister } from './useCanister';

export type { _SERVICE } from 'backend-ts';

export const useBackend = () => {
  const canisterId = process.env.FEED_APP_CANISTER_ID!;

  return useCanister<_SERVICE>(idl, { canisterId });
};

export const backendSerializer = buildSerializer<_SERVICE>(idl);
