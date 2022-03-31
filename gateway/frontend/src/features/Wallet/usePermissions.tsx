import { useTrigger } from 'toolkit';
import { useWallet } from 'services';
import { useCurrentWallet } from './context';

export function usePermissions() {
  const { rnp, principal } = useCurrentWallet();
  const { canister, fetching, data } = useWallet(principal);

  useTrigger(
    (rnp) => {
      canister
        .get_permission_ids({ rnp })
        .then(({ ids }) => (ids.length ? canister.get_permissions({ rnp, ids }) : null));
    },
    rnp,
    [],
  );

  return {
    permissions: data.get_permissions?.permissions || [],
    fetching: !!fetching.get_permission_ids || !!fetching.get_permissions,
  };
}
