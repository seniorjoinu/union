import { useCallback } from 'react';
import { RoleType } from 'wallet-ts';
import { walletSerializer } from '../../../services';
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

    let roleType: RoleType = { Everyone: null };

    if (values.type == 'FractionOf') {
      roleType = {
        FractionOf: {
          name: values.name,
          description: values.description,
          fraction: values.threshold,
          enumerated: values.owners.map((e) => Number(e)),
        },
      };
    } else {
      roleType = {
        QuantityOf: {
          name: values.name,
          description: values.description,
          // @ts-expect-error
          quantity: BigInt(values.threshold),
          enumerated: values.owners.map((e) => Number(e)),
        },
      };
    }

    const payload: ExternalExecutorFormData = {
      title: 'Create new role',
      description: 'Create new role through interface',
      rnp,
      program: [
        {
          endpoint: {
            canister_id: principal,
            method_name: 'create_role',
          },
          cycles: '1',
          args_candid: walletSerializer.create_role({
            role_type: roleType,
          }),
        },
      ],
    };

    console.log('onCreate payload', payload);

    return payload;
  }, [create, getValues, principal, rnp]);

  return {
    onCreate,
  };
};
