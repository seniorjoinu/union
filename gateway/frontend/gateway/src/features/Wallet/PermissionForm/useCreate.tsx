import { Principal } from '@dfinity/principal';
import { useCallback } from 'react';
import { PermissionScope, PermissionTarget } from 'wallet-ts';
import { walletSerializer } from 'services';
import { ExternalExecutorFormData } from '../../Executor';
import { useCurrentWallet } from '../context';
import { UseSubmitProps } from './types';

export interface UseCreateProps {
  create?: boolean;
  getValues: UseSubmitProps['getValues'];
}

export const useCreate = ({ create, getValues }: UseCreateProps) => {
  const { rnp, principal } = useCurrentWallet();

  const onCreate = useCallback(async (): Promise<ExternalExecutorFormData> => {
    if (!create || !rnp) {
      return Promise.reject();
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

    const payload: ExternalExecutorFormData = {
      title: 'Create new permission',
      description: 'Create new permission through interface',
      rnp,
      program: [
        {
          endpoint: {
            canister_id: principal,
            method_name: 'create_permission',
          },
          cycles: '0',
          args_candid: walletSerializer.create_permission({
            name: values.name,
            scope,
            targets,
          }),
        },
      ],
    };

    return payload;
  }, [create, getValues, principal, rnp]);

  return {
    onCreate,
  };
};
