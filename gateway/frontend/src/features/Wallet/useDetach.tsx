import { useCallback } from 'react';
import { useUnion, walletSerializer } from 'services';
import { Permission, Role } from 'union-ts';
import { useNavigate } from 'react-router-dom';
import { ExternalExecutorFormData } from '../Executor';
import { useCurrentUnion } from './context';
import { parseRole } from './utils';

export function useDetach() {
  const nav = useNavigate();
  const { rnp, principal } = useCurrentUnion();
  const { canister, fetching } = useUnion(principal);

  const detachRoleAndPermission = useCallback(
    async (
      role: Role,
      permission: Permission,
      verbose?: { title?: string; description?: string },
    ) => {
      if (!rnp) {
        return;
      }

      const parsed = parseRole(role.role_type);

      const payload: ExternalExecutorFormData = {
        title: verbose?.title || 'Detach role from permission',
        description:
          verbose?.description ||
          `Detach role "${parsed.title}" from permission "${permission.name}"(id ${permission.id})`,
        rnp,
        program: {
          RemoteCallSequence: [
            {
              endpoint: {
                canister_id: principal,
                method_name: 'detach_role_from_permission',
              },
              cycles: BigInt(0),
              args: {
                CandidString: walletSerializer.detach_role_from_permission({
                  role_id: role.id,
                  permission_id: permission.id,
                }),
              },
            },
          ],
        },
      };

      nav(`/wallet/${principal}/execute`, { state: payload });
    },
    [canister, fetching, rnp],
  );

  return {
    detachRoleAndPermission,
  };
}
