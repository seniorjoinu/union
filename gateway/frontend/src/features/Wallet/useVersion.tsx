import React, { useCallback } from 'react';
import { deployerSerializer, deployerEncoder } from 'services';
import { useNavigate } from 'react-router-dom';
import { Principal } from '@dfinity/principal';
import { useCurrentUnion } from './context';

export interface FormData {
  version: string;
  description: string;
  file: File | null;
}

export interface UseCreateVersionProps {
  getValues(): FormData;
}

export const useCreateVersion = ({ getValues }: UseCreateVersionProps) => {
  const { principal } = useCurrentUnion();
  const nav = useNavigate();

  const create = useCallback(
    async (verbose?: { title?: string; description?: string }) => {
      const { version: rawVersion, description, file } = getValues();

      const version = rawVersion.replaceAll('_', '');

      const binary = file ? [...new Uint8Array(await file.arrayBuffer())] : [];

      if (!binary.length) {
        return Promise.reject();
      }

      const encoded = deployerEncoder.upload_binary({
        version,
        binary,
      });

      // const payload: ExternalExecutorFormData = {
      //   title: verbose?.title || 'Create new version of union-wallet',
      //   description: verbose?.description || 'Create new version through interface',
      //   rnp,
      //   program: {
      //     RemoteCallSequence: [
      //       {
      //         endpoint: {
      //           canister_id: Principal.from(process.env.UNION_DEPLOYER_CANISTER_ID),
      //           method_name: 'create_binary_version',
      //         },
      //         cycles: BigInt(0),
      //         args: {
      //           CandidString: deployerSerializer.create_binary_version({
      //             version,
      //             description,
      //           }),
      //         },
      //       },
      //       {
      //         endpoint: {
      //           canister_id: Principal.from(process.env.UNION_DEPLOYER_CANISTER_ID),
      //           method_name: 'upload_binary',
      //         },
      //         cycles: BigInt(0),
      //         args: { Encoded: [...new Uint8Array(encoded)] },
      //       },
      //       {
      //         endpoint: {
      //           canister_id: Principal.from(process.env.UNION_DEPLOYER_CANISTER_ID),
      //           method_name: 'release_binary_version',
      //         },
      //         cycles: BigInt(0),
      //         args: {
      //           CandidString: deployerSerializer.release_binary_version({
      //             version,
      //           }),
      //         },
      //       },
      //     ],
      //   },
      // };

      // nav(`/wallet/${principal}/execute`, { state: payload });
    },
    [getValues, principal],
  );

  return { create };
};

export interface RemoveVersionProps {
  walletId: string;
  version: string;
}

export const useRemoveVersion = () => {
  const nav = useNavigate();

  const remove = useCallback(
    async (
      { walletId, version }: RemoveVersionProps,
      verbose?: { title?: string; description?: string },
    ) => {
      // const payload: ExternalExecutorFormData = {
      //   title: verbose?.title || 'Delete version of union-wallet',
      //   description: verbose?.description || `Delete version "${version}" through interface`,
      //   program: {
      //     RemoteCallSequence: [
      //       {
      //         endpoint: {
      //           canister_id: Principal.from(process.env.UNION_DEPLOYER_CANISTER_ID),
      //           method_name: 'delete_binary_version',
      //         },
      //         cycles: BigInt(0),
      //         args: {
      //           CandidString: deployerSerializer.delete_binary_version({
      //             version,
      //           }),
      //         },
      //       },
      //     ],
      //   },
      // };
      // nav(`/wallet/${walletId}/execute`, { state: payload });
    },
    [],
  );

  return { remove };
};
