import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { walletSerializer } from 'services';
import { ExternalExecutorFormData } from '../Executor';
import { parseRole } from './utils';
import { useRoles } from './useRoles';
import { useCurrentWallet } from './context';
import { usePermissions } from './usePermissions';

export function useAttach() {
  const { roles } = useRoles();
  const { permissions } = usePermissions();
  const nav = useNavigate();
  const { rnp, principal } = useCurrentWallet();

  const attach = useCallback(
    (permissionIds: (string | number)[], roleIds: (number | string)[]) => {
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

      const permissionNames = permissionIds
        .map((id) => {
          const permission = permissions.find((p) => p.id == Number(id));

          return `${permission?.name || 'Unknown'}(${String(id)})`;
        })
        .join();

      const payload: ExternalExecutorFormData = {
        title: 'Attach roles to permission',
        description: `Attach roles "${roleNames}" to permissions "${permissionNames}"`,
        rnp,
        program: roleIds
          .map((roleId) =>
            permissionIds.map((permissionId) => ({
              endpoint: {
                canister_id: principal,
                method_name: 'attach_role_to_permission',
              },
              cycles: '0',
              args_candid: walletSerializer.attach_role_to_permission({
                role_id: Number(roleId),
                permission_id: Number(permissionId),
              }),
            })),
          )
          .flat(),
      };

      nav(`/wallet/${principal}/execute`, { state: payload });
    },
    [roles, permissions, nav],
  );

  return { attach };
}
