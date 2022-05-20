import React, { useCallback } from 'react';
import { IDL } from '@dfinity/candid';
import { Principal } from '@dfinity/principal';
import { useCurrentUnion } from '../context';
import { useCreateCanister, useUpdateCanister, UpdateFormData } from './useManagementCanister';

export const useCreateAssetsCanister = () => useCreateCanister({});

export interface UpdateAssetCanisterFormData {
  canisterId: string;
  file: File | null;
  mode: UpdateFormData['mode'];
}

export interface UseUpdateAssetCanisterProps {
  getValues(): UpdateAssetCanisterFormData;
}

export const useUpdateAssetCanister = ({
  getValues: getFormValues,
}: UseUpdateAssetCanisterProps) => {
  const { principal } = useCurrentUnion();

  const getValues = useCallback(() => {
    const argsBuffer = IDL.encode([IDL.Principal], [Principal.from(principal)]);

    return {
      ...getFormValues(),
      args: [...new Uint8Array(argsBuffer)],
    };
  }, [getFormValues, principal]);

  return useUpdateCanister({ getValues });
};
