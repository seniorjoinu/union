import { Principal } from '@dfinity/principal';
import { useCallback } from 'react';
import { RoleType } from 'wallet-ts';
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

    const result = await canister.execute({
      title: 'Create new role',
      description: 'Create new role through interface',
      rnp,
      authorization_delay_nano: BigInt(100),
      program: {
        RemoteCallSequence: [
          {
            endpoint: {
              canister_id: Principal.fromText(principal),
              method_name: 'create_role',
            },
            cycles: BigInt(0),
            args_candid: walletSerializer.create_role({
              role_type: roleType,
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
