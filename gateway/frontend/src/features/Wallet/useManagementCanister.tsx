import React, { useCallback } from 'react';
import { managementEncoder, managementSerializer } from 'services';
import { useNavigate } from 'react-router-dom';
import { checkPrincipal } from 'toolkit';
import { Principal } from '@dfinity/principal';
import { useCurrentUnion } from './context';

export interface UseCreateCanisterProps {}

export const useCreateCanister = (_: UseCreateCanisterProps) => {
  const { principal } = useCurrentUnion();
  const nav = useNavigate();

  const createCanister = useCallback(async () => {
    // const payload: ExternalExecutorFormData = {
    //   title: 'Create canister',
    //   description: 'Create canister with management canister',
    //   rnp,
    //   program: {
    //     RemoteCallSequence: [
    //       {
    //         endpoint: {
    //           canister_id: Principal.from(process.env.MANAGEMENT_CANISTER_ID),
    //           method_name: 'create_canister',
    //         },
    //         cycles: BigInt(10 ** 9),
    //         args: { CandidString: managementSerializer.create_canister({ settings: [] }) },
    //       },
    //     ],
    //   },
    // };
    // nav(`/wallet/${principal}/execute`, { state: payload });
  }, [principal]);

  return { createCanister };
};

export interface UpdateFormData {
  canisterId: string;
  file: File | null;
  args: number[];
  mode: 'install' | 'reinstall' | 'upgrade';
}

export interface UseUpdateCanisterProps {
  getValues(): UpdateFormData;
}

export const useUpdateCanister = ({ getValues }: UseUpdateCanisterProps) => {
  const { principal } = useCurrentUnion();
  const nav = useNavigate();

  const updateCanister = useCallback(async () => {
    const walletCanisterId = checkPrincipal(principal);

    if (!walletCanisterId) {
      return Promise.reject('Wrong wallet canister id');
    }

    const { canisterId: rawCanisterId, file, args, mode } = getValues();
    const canisterId = checkPrincipal(rawCanisterId);

    if (!canisterId) {
      return Promise.reject('Wrong canister id');
    }

    const binary = file ? [...new Uint8Array(await file.arrayBuffer())] : [];

    if (!binary.length) {
      return Promise.reject('File not found');
    }

    const encoded = managementEncoder.install_code({
      // @ts-expect-error
      mode: { [mode]: null },
      canister_id: canisterId,
      wasm_module: binary,
      arg: args,
    });

    // const payload: ExternalExecutorFormData = {
    //   title: 'Install code to canister',
    //   description: 'Install code and set current wallet as controller',
    //   rnp,
    //   program: {
    //     RemoteCallSequence: [
    //       {
    //         endpoint: {
    //           canister_id: Principal.from(process.env.MANAGEMENT_CANISTER_ID),
    //           method_name: 'install_code',
    //         },
    //         cycles: BigInt(0),
    //         args: { Encoded: [...new Uint8Array(encoded)] },
    //       },
    //       {
    //         endpoint: {
    //           canister_id: Principal.from(process.env.MANAGEMENT_CANISTER_ID),
    //           method_name: 'update_settings',
    //         },
    //         cycles: BigInt(0),
    //         args: {
    //           CandidString: managementSerializer.update_settings({
    //             canister_id: canisterId,
    //             settings: {
    //               controllers: [[walletCanisterId]],
    //               freezing_threshold: [],
    //               memory_allocation: [],
    //               compute_allocation: [],
    //             },
    //           }),
    //         },
    //       },
    //     ],
    //   },
    // };

    // nav(`/wallet/${principal}/execute`, { state: payload });
  }, [getValues, principal]);

  return { updateCanister };
};
