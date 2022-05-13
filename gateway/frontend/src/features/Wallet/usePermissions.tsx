import { useEffect } from 'react';
import { useUnion } from 'services';
import { useCurrentUnion } from './context';

export function usePermissions() {
  const { principal } = useCurrentUnion();
  const { canister, fetching, data } = useUnion(principal);

  useEffect(() => {
    canister.list_permissions({
      page_req: {
        page_size: 100,
        page_index: 0,
        sort: null,
        filter: { target: [] },
      },
    });
  }, []);

  return {
    permissions: data.list_permissions?.page.data || [],
    fetching: !!fetching.list_permissions,
  };
}
