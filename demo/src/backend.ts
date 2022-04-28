import { _SERVICE } from 'backend-ts';
// @ts-expect-error
import { idlFactory as idl } from 'backend-idl';
import { useCanister } from './actor';

export const useBackend = () => {
  const canisterId = process.env.FEED_APP_CANISTER_ID!;
  return useCanister<_SERVICE>(idl, { canisterId });
};
