import { useEffect } from 'react';
import { useWallet } from 'services';
import { useCurrentWallet } from './context';

export function usePermissions() {
  const { principal } = useCurrentWallet();
  const { canister, fetching, data } = useWallet(principal);

  useEffect(() => {
    canister
      .get_permission_ids()
      .then(({ ids }) => (ids.length ? canister.get_permissions({ ids }) : null));
  }, []);

  return {
    permissions: data.get_permissions?.permissions || [],
    fetching: !!fetching.get_permission_ids || !!fetching.get_permissions,
  };
}
