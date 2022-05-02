import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { walletSerializer } from 'services';
import { ExternalExecutorFormData } from '../Executor';
import { useCurrentWallet } from './context';

export function useRemove() {
  const nav = useNavigate();
  const { rnp, principal } = useCurrentWallet();

  const removeRole = useCallback(
    (roleIds: (number | string)[], verbose?: { title?: string; description?: string }) => {
      if (!rnp) {
        return;
      }

      const payload: ExternalExecutorFormData = {
        title: verbose?.title || 'Remove roles',
        description: verbose?.description || `Remove roles "${roleIds.join()}"`,
        rnp,
        program: {
          RemoteCallSequence: roleIds.map((roleId) => ({
            endpoint: {
              canister_id: principal,
              method_name: 'remove_role',
            },
            cycles: BigInt(0),
            args: {
              CandidString: walletSerializer.remove_role({
                role_id: Number(roleId),
              }),
            },
          })),
        },
      };

      nav(`/wallet/${principal}/execute`, { state: payload });
    },
    [rnp, nav],
  );

  const removePermission = useCallback(
    (permissionIds: (number | string)[], verbose?: { title?: string; description?: string }) => {
      if (!rnp) {
        return;
      }

      const payload: ExternalExecutorFormData = {
        title: verbose?.title || 'Remove permissions',
        description: verbose?.description || `Remove permissions "${permissionIds.join()}"`,
        rnp,
        program: {
          RemoteCallSequence: permissionIds.map((permissionId) => ({
            endpoint: {
              canister_id: principal,
              method_name: 'remove_permission',
            },
            cycles: BigInt(0),
            args: {
              CandidString: walletSerializer.remove_permission({
                permission_id: Number(permissionId),
              }),
            },
          })),
        },
      };

      nav(`/wallet/${principal}/execute`, { state: payload });
    },
    [rnp, nav],
  );

  return { removeRole, removePermission };
}
