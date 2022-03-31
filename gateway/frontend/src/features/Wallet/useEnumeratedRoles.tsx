import { useCallback } from 'react';
import { Role } from 'wallet-ts';
import { useWallet, walletSerializer } from 'services';
import { useNavigate } from 'react-router-dom';
import { ExternalExecutorFormData } from '../Executor';
import { useRoles } from './useRoles';
import { useCurrentWallet } from './context';
import { parseRole } from './utils';

export function useEnumeratedRoles() {
  const nav = useNavigate();
  const { roles } = useRoles();
  const { rnp, principal } = useCurrentWallet();
  const { canister, fetching } = useWallet(principal);

  const addEnumeratedRoles = useCallback(
    async (role: Role, roleIds: (number | string)[]) => {
      if (!rnp) {
        return;
      }

      const parsedRole = parseRole(role.role_type);
      const roleNames = roleIds
        .map((id) => {
          const role = roles.find((r) => r.id == Number(id));
          const name = role ? parseRole(role.role_type).title : 'Unknown';

          return name;
        })
        .join();

      const payload: ExternalExecutorFormData = {
        title: `Attach enumerated roles to role "${parsedRole.title}"`,
        description: `Attach roles "${roleNames}" to role "${parsedRole.title}"(id ${role.id})`,
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
    [canister, fetching, rnp, roles],
  );

  const substractEnumeratedRoles = useCallback(
    async (role: Role, roleIds: (number | string)[]) => {
      if (!rnp) {
        return;
      }

      const parsedRole = parseRole(role.role_type);
      const roleNames = roleIds
        .map((id) => {
          const role = roles.find((r) => r.id == Number(id));
          const name = role ? parseRole(role.role_type).title : 'Unknown';

          return name;
        })
        .join();

      const payload: ExternalExecutorFormData = {
        title: `Substract enumerated roles to role "${parsedRole.title}"`,
        description: `Substract roles "${roleNames}" to role "${parsedRole.title}"(id ${role.id})`,
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
    [canister, fetching, rnp, roles],
  );

  return {
    addEnumeratedRoles,
    substractEnumeratedRoles,
  };
}
