import React, { useEffect, createContext, useContext, useMemo, useState, useCallback } from 'react';
import { RoleAndPermission, Role, Permission } from 'wallet-ts';
import { useWallet } from 'services';

export interface CurrentWalletContext {
  principal: string;
  rnp: RoleAndPermission | null;
  setRoleAndPermission(rnp: Partial<RoleAndPermission>): void;
  roles: Role[];
  permissions: Permission[];
  fetching: ReturnType<typeof useWallet>['fetching'];
  errors: ReturnType<typeof useWallet>['errors'];
  fetchMyData(): void;
}

const context = createContext<CurrentWalletContext>({
  principal: '',
  rnp: null,
  setRoleAndPermission: () => undefined,
  roles: [],
  permissions: [],
  fetching: {},
  errors: {},
  fetchMyData: () => undefined,
});

export interface ProviderProps {
  principal: string;
  children: any;
}

export function Provider({ principal, children }: ProviderProps) {
  const [rnp, setRnp] = useState<RoleAndPermission | null>(null);
  const { data, canister, fetching, errors } = useWallet(principal);

  useEffect(() => {
    canister.get_my_roles();
    canister.get_my_permissions();
  }, []);

  const { roles } = data.get_my_roles || { roles: [] };
  const { permissions } = data.get_my_permissions || { permissions: [] };

  const setRoleAndPermission = useCallback(
    (rnp: RoleAndPermission) => {
      setRnp(rnp);
    },
    [setRnp],
  );

  const fetchMyData = useCallback(() => {
    canister.get_my_roles();
    canister.get_my_permissions();
  }, []);

  const value: CurrentWalletContext = useMemo(() => {
    let computedRnp = rnp;

    if (!computedRnp) {
      const roleId =
        roles.find(
          (r) =>
            'QuantityOf' in r.role_type &&
            r.role_type.QuantityOf.name.toLowerCase() == 'has profile',
        )?.id || roles.find((r) => 'Everyone' in r.role_type)?.id;
      const permissionId = permissions[0]?.id;
      const rnpExist = typeof roleId !== 'undefined' && typeof permissionId !== 'undefined';

      if (rnpExist) {
        computedRnp = { role_id: roleId, permission_id: permissionId };
        setRoleAndPermission(computedRnp);
      }
    }

    return {
      principal,
      rnp: computedRnp,
      setRoleAndPermission,
      roles,
      permissions,
      fetching,
      errors,
      fetchMyData,
    };
  }, [principal, roles, permissions, fetching, errors, setRoleAndPermission, rnp]);

  return <context.Provider value={value}>{children}</context.Provider>;
}

export const useCurrentWallet = () => useContext(context);
