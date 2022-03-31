import { useCallback } from 'react';
import { useWallet, walletSerializer } from 'services';
import { Permission, Role } from 'wallet-ts';
import { useNavigate } from 'react-router-dom';
import { ExternalExecutorFormData } from '../Executor';
import { useCurrentWallet } from './context';
import { parseRole } from './utils';

export function useDetach() {
  const nav = useNavigate();
  const { rnp, principal } = useCurrentWallet();
  const { canister, fetching } = useWallet(principal);

  const detachRoleAndPermission = useCallback(
    async (role: Role, permission: Permission) => {
      if (!rnp) {
        return;
      }

      const parsed = parseRole(role.role_type);

      const payload: ExternalExecutorFormData = {
        title: 'Detach role from permission',
        description: `Detach role "${parsed.title}" from permission "${permission.name}"(id ${permission.id})`,
        rnp,
        program: [
          {
            endpoint: {
              canister_id: principal,
              method_name: 'detach_role_from_permission',
            },
            cycles: '0',
            args_candid: walletSerializer.detach_role_from_permission({
              role_id: role.id,
              permission_id: permission.id,
            }),
          },
        ],
      };

      nav(`/wallet/${principal}/execute`, { state: payload });
    },
    [canister, fetching, rnp],
  );

  return {
    detachRoleAndPermission,
  };
}
