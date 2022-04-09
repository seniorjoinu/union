import React, { useCallback } from 'react';
import { deployerSerializer, deployerEncoder } from 'services';
import { useNavigate } from 'react-router-dom';
import { useCurrentWallet } from '../context';
import { ExternalExecutorFormData } from '../../../features/Executor';

export interface FormData {
  version: string;
  description: string;
  file: File | null;
}

export interface UseCreateVersionProps {
  getValues(): FormData;
}

export const useCreateVersion = ({ getValues }: UseCreateVersionProps) => {
  const { rnp, principal } = useCurrentWallet();
  const nav = useNavigate();

  const create = useCallback(async () => {
    if (!rnp) {
      return Promise.reject();
    }

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

    const payload: ExternalExecutorFormData = {
      title: 'Create new version of union-wallet',
      description: 'Create new version through interface',
      rnp,
      program: [
        {
          endpoint: {
            canister_id: process.env.UNION_DEPLOYER_CANISTER_ID,
            method_name: 'create_binary_version',
          },
          cycles: '1',
          args_candid: deployerSerializer.create_binary_version({
            version,
            description,
          }),
        },
        {
          endpoint: {
            canister_id: process.env.UNION_DEPLOYER_CANISTER_ID,
            method_name: 'upload_binary',
          },
          cycles: '1',
          args_encoded: [...new Uint8Array(encoded)],
          args_candid: [],
        },
        {
          endpoint: {
            canister_id: process.env.UNION_DEPLOYER_CANISTER_ID,
            method_name: 'release_binary_version',
          },
          cycles: '1',
          args_candid: deployerSerializer.release_binary_version({
            version,
          }),
        },
      ],
    };

    nav(`/wallet/${principal}/execute`, { state: payload });
  }, [getValues, principal, rnp]);

  return { create };
};
