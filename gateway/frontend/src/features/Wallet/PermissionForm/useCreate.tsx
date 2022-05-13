import { Principal } from '@dfinity/principal';
import { useCallback } from 'react';
import { PermissionTarget } from 'union-ts';
import { useCurrentUnion } from '../context';
import { UseSubmitProps } from './types';

export interface UseCreateProps {
  create?: boolean;
  getValues: UseSubmitProps['getValues'];
}

export const useCreate = ({ create, getValues }: UseCreateProps) => {
  const { principal } = useCurrentUnion();

  const onCreate = useCallback(async () => {
    if (!create) {
      return Promise.reject();
    }

    const values = getValues();

    const targets: PermissionTarget[] = values.targets.map((t) => {
      if (!t.canisterId) {
        return { SelfEmptyProgram: null };
      }
      return {
        Endpoint: { canister_id: Principal.fromText(t.canisterId), method_name: t.methodName },
      };
    });

    // const payload: ExternalExecutorFormData = {
    //   program: {
    //     RemoteCallSequence: [
    //       {
    //         endpoint: {
    //           canister_id: principal,
    //           method_name: 'create_permission',
    //         },
    //         cycles: BigInt(0),
    //         args: {
    //           CandidString: walletSerializer.create_permission({
    //             name: values.name,
    //             description: values.description,
    //             targets,
    //           }),
    //         },
    //       },
    //     ],
    //   },
    // };

    // return payload;
  }, [create, getValues, principal]);

  return {
    onCreate,
  };
};
