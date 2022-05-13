import React, { useEffect, createContext, useContext, useMemo, useState, useCallback } from 'react';
import { useUnion } from 'services';
import { Principal } from '@dfinity/principal';
import { Group, Profile } from 'union-ts';

export interface CurrentWalletContext {
  principal: Principal;
  groups: Group[];
  profile: Profile | null;
  fetching: ReturnType<typeof useUnion>['fetching'];
  errors: ReturnType<typeof useUnion>['errors'];
  fetchMyData(): void;
}

const context = createContext<CurrentWalletContext>({
  principal: Principal.anonymous(),
  groups: [],
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
    canister.get_my_groups();
    canister.get_my_profile();
  }, []);

  const fetchMyData = useCallback(
    async () => Promise.all([canister.get_my_groups(), canister.get_my_profile()]),
    [],
  );

  const value: CurrentWalletContext = useMemo(
    () => ({
      principal,
      groups: data.get_my_groups?.groups || [],
      profile: data.get_my_profile?.profile || null,
      fetching,
      errors,
      fetchMyData,
    }),
    [principal, fetching, errors, data.get_my_groups, data.get_my_profile],
  );

  return <context.Provider value={value}>{children}</context.Provider>;
}

export const useCurrentUnion = () => useContext(context);
