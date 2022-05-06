import { useEffect, useMemo } from 'react';
import { FractionOf, Profile, QuantityOf } from 'union-ts';
import { useUnion } from 'services';
import { useCurrentUnion } from './context';

export function useFilteredRoles<T = Profile | FractionOf | QuantityOf>(
  type: 'Profile' | 'FractionOf' | 'QuantityOf',
): { roles: T[]; fetching: boolean } {
  const { fetching, roles } = useRoles();

  const filteredRoles = useMemo(
    () =>
      roles
        // @ts-expect-error // FIXME
        .map((r) => (type in r.role_type ? r.role_type[type] : null))
        .filter((r): r is T => !!r),
    [roles, type],
  );

  return {
    roles: filteredRoles,
    fetching,
  };
}

export function useRoles() {
  const { principal } = useCurrentUnion();
  const { canister, fetching, data } = useUnion(principal);

  useEffect(() => {
    canister.get_role_ids().then(({ ids }) => (ids.length ? canister.get_roles({ ids }) : null));
  }, []);

  return {
    roles: data.get_roles?.roles || [],
    fetching: !!fetching.get_role_ids || !!fetching.get_roles,
  };
}
