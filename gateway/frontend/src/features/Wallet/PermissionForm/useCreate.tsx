import { Principal } from '@dfinity/principal';
import { useCallback } from 'react';
import { PermissionScope, PermissionTarget } from 'wallet-ts';
import { useWallet, walletSerializer } from '../../../services';
import { useCurrentWallet } from '../context';
import { UseSubmitProps } from './types';

export interface UseCreateProps {
  create?: boolean;
  getValues: UseSubmitProps['getValues'];
}

export const useCreate = ({ create, getValues }: UseCreateProps) => {
  const { rnp, principal } = useCurrentWallet();
  const { canister } = useWallet(principal);

  const onCreate = useCallback(async () => {
    if (!create || !rnp) {
      return;
    }

    const values = getValues();

    const scope = { [values.scope]: null } as PermissionScope;
    const targets: PermissionTarget[] = values.targets.map((t) => {
      if (!t.canisterId) {
        return { SelfEmptyProgram: null };
      }
      if (t.canisterId && !t.methodName) {
        return { Canister: Principal.fromText(t.canisterId) };
      }
      return {
        Endpoint: { canister_id: Principal.fromText(t.canisterId), method_name: t.methodName },
      };
    });

    const result = await canister.execute({
      title: 'Create new permission',
      description: 'Create new permission through interface',
      rnp,
      authorization_delay_nano: BigInt(100),
      program: {
        RemoteCallSequence: [
          {
            endpoint: {
              canister_id: Principal.fromText(principal),
              method_name: 'create_permission',
            },
            cycles: BigInt(0),
            args_candid: walletSerializer.create_permission({
              name: values.name,
              scope,
              targets,
            }),
          },
        ],
      },
    });

    console.log('!!!RES', result);
    return result;
  }, [create, canister, getValues, principal, rnp]);

  return {
    onCreate,
  };
};
