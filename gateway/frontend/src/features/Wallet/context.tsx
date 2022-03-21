import React, { useEffect, createContext, useContext, useMemo } from 'react';
import { RoleAndPermission, Role, Permission } from 'wallet-ts';
import { useWallet, Fetching } from '../../services';

export interface CurrentWalletContext {
  rnp: RoleAndPermission | null;
  roles: Role[];
  permissions: Permission[];
  fetching: Fetching;
  error: Error | null;
}

const context = createContext<CurrentWalletContext>({
  rnp: null,
  roles: [],
  permissions: [],
  fetching: {},
  error: null,
});

export interface ProviderProps {
  principal: string;
  children: any;
}

export function Provider({ principal, children }: ProviderProps) {
  const { data, canister, fetching, error } = useWallet(principal);

  useEffect(() => {
    canister.get_my_roles();
    canister.get_my_permissions();
  }, []);

  const { roles } = data.get_my_roles || { roles: [] };
  const { permissions } = data.get_my_permissions || { permissions: [] };

  const value: CurrentWalletContext = useMemo(() => {
    const roleId = roles.find((r) => 'Everyone' in r.role_type)?.id;
    const permissionId = permissions.find((p) => p.name.toLowerCase() == 'default')?.id;
    const rnpExist = typeof roleId !== 'undefined' && typeof permissionId !== 'undefined';

    return {
      rnp: rnpExist ? { role_id: roleId, permission_id: permissionId } : null,
      roles,
      permissions,
      fetching,
      error,
    };
  }, [roles, permissions, fetching, error]);

  return <context.Provider value={value}>{children}</context.Provider>;
}

export const useCurrentWallet = () => useContext(context);
