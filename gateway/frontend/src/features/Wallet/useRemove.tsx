import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { walletSerializer } from 'services';
import { ExternalExecutorFormData } from '../Executor';
import { parseRole } from './utils';
import { useRoles } from './useRoles';
import { useCurrentWallet } from './context';
import { usePermissions } from './usePermissions';

export function useRemove() {
  const { roles } = useRoles();
  const { permissions } = usePermissions();
  const nav = useNavigate();
  const { rnp, principal } = useCurrentWallet();

  const removeRole = useCallback(
    (roleIds: (number | string)[]) => {
      if (!rnp) {
        return;
      }

      const roleNames = roleIds
        .map((id) => {
          const role = roles.find((r) => r.id == Number(id));
          const name = role ? parseRole(role.role_type).title : 'Unknown';

          return `${name}(${String(id)})`;
        })
        .join();

      const payload: ExternalExecutorFormData = {
        title: 'Remove roles',
        description: `Remove roles "${roleNames}"`,
        rnp,
        program: roleIds.map((roleId) => ({
          endpoint: {
            canister_id: principal,
            method_name: 'remove_role',
          },
          cycles: '0',
          args_candid: walletSerializer.remove_role({
            role_id: Number(roleId),
          }),
        })),
      };

      nav(`/wallet/${principal}/execute`, { state: payload });
    },
    [roles, nav],
  );

  const removePermission = useCallback(
    (permissionIds: (number | string)[]) => {
      if (!rnp) {
        return;
      }

      const names = permissionIds
        .map((id) => {
          const permission = permissions.find((r) => r.id == Number(id));
          const name = permission?.name || 'Unknown';

          return `${name}(${String(id)})`;
        })
        .join();

      const payload: ExternalExecutorFormData = {
        title: 'Remove permissions',
        description: `Remove permissions "${names}"`,
        rnp,
        program: permissionIds.map((permissionId) => ({
          endpoint: {
            canister_id: principal,
            method_name: 'remove_permission',
          },
          cycles: '0',
          args_candid: walletSerializer.remove_permission({
            permission_id: Number(permissionId),
          }),
        })),
      };

      nav(`/wallet/${principal}/execute`, { state: payload });
    },
    [permissions, nav],
  );

  return { removeRole, removePermission };
}
