import { useEffect } from 'react';
import { useUnion } from 'services';
import { useCurrentUnion } from './context';

export function usePermissions() {
  const { principal } = useCurrentUnion();
  const { canister, fetching, data } = useUnion(principal);

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
