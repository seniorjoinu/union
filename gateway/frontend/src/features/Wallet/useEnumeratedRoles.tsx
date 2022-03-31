import { useCallback } from 'react';
import { Role } from 'wallet-ts';
import { useWallet, walletSerializer } from 'services';
import { useNavigate } from 'react-router-dom';
import { ExternalExecutorFormData } from '../Executor';
import { useCurrentWallet } from './context';
import { parseRole } from './utils';

export function useEnumeratedRoles() {
  const nav = useNavigate();
  const { rnp, principal } = useCurrentWallet();
  const { canister, fetching } = useWallet(principal);

  const addEnumeratedRoles = useCallback(
    async (
      role: Role,
      roleIds: (number | string)[],
      verbose?: { title?: string; description?: string },
    ) => {
      if (!rnp) {
        return;
      }

      const parsedRole = parseRole(role.role_type);

      const payload: ExternalExecutorFormData = {
        title: verbose?.title || `Attach enumerated roles to role "${parsedRole.title}"`,
        description:
          verbose?.description ||
          `Attach roles "${roleIds.join()}" to role "${parsedRole.title}"(id ${role.id})`,
        rnp,
        program: [
          {
            endpoint: {
              canister_id: principal,
              method_name: 'add_enumerated_roles',
            },
            cycles: '0',
            args_candid: walletSerializer.add_enumerated_roles({
              role_id: role.id,
              enumerated_roles_to_add: roleIds.map((rId) => Number(rId)),
            }),
          },
        ],
      };

      nav(`/wallet/${principal}/execute`, { state: payload });
    },
    [canister, fetching, rnp],
  );

  const substractEnumeratedRoles = useCallback(
    async (
      role: Role,
      roleIds: (number | string)[],
      verbose?: { title?: string; description?: string },
    ) => {
      if (!rnp) {
        return;
      }

      const parsedRole = parseRole(role.role_type);

      const payload: ExternalExecutorFormData = {
        title: verbose?.title || `Substract enumerated roles to role "${parsedRole.title}"`,
        description:
          verbose?.description ||
          `Substract roles "${roleIds.join()}" to role "${parsedRole.title}"(id ${role.id})`,
        rnp,
        program: [
          {
            endpoint: {
              canister_id: principal,
              method_name: 'subtract_enumerated_roles',
            },
            cycles: '0',
            args_candid: walletSerializer.subtract_enumerated_roles({
              role_id: role.id,
              enumerated_roles_to_subtract: roleIds.map((rId) => Number(rId)),
            }),
          },
        ],
      };

      nav(`/wallet/${principal}/execute`, { state: payload });
    },
    [canister, fetching, rnp],
  );

  return {
    addEnumeratedRoles,
    substractEnumeratedRoles,
  };
}
