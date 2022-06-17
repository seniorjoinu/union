import React, { useEffect, createContext, useContext, useMemo, useCallback } from 'react';
import { useUnion, _SERVICE } from 'services';
import { Principal } from '@dfinity/principal';
import { GroupExt, Profile } from 'union-ts';

export interface CurrentWalletContext {
  principal: Principal;
  groups: GroupExt[];
  canister: _SERVICE;
  profile: Profile | null;
  fetching: ReturnType<typeof useUnion>['fetching'];
  errors: ReturnType<typeof useUnion>['errors'];
  fetchMyData(): void;
}

const context = createContext<CurrentWalletContext>({
  principal: Principal.anonymous(),
  groups: [],
  // @ts-expect-error
  canister: null,
  profile: null,
  fetching: {},
  errors: {},
  fetchMyData: () => undefined,
});

export interface ProviderProps {
  principal: Principal;
  children: any;
}

export function Provider({ principal, children }: ProviderProps) {
  const { data, canister, fetching, errors } = useUnion(principal);

  useEffect(() => {
    fetchMyData();
  }, []);

  const fetchMyData = useCallback(async () => {
    if (!!fetching.get_my_groups || !!fetching.get_my_profile) {
      return;
    }
    return await Promise.all([canister.get_my_groups(), canister.get_my_profile()]);
  }, [fetching]);

  const value: CurrentWalletContext = useMemo(
    () => ({
      principal,
      groups: data.get_my_groups?.groups || [],
      profile: data.get_my_profile?.profile || null,
      canister,
      fetching,
      errors,
      fetchMyData,
    }),
    [canister, principal, fetching, errors, data.get_my_groups, data.get_my_profile],
  );

  return <context.Provider value={value}>{children}</context.Provider>;
}

export const useCurrentUnion = () => useContext(context);
