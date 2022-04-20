import React, { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet, walletEncoder } from 'services';
import { ExternalExecutorFormData } from '../../Executor';
import { useCurrentWallet } from '../context';

export interface SetInfoFormData {
  name: string;
  description: string;
  logo: Blob | File | null;
}

export interface UseSetInfoProps {
  getValues(): SetInfoFormData;
}

export const useSetInfo = ({ getValues }: UseSetInfoProps) => {
  const { principal, rnp } = useCurrentWallet();
  const nav = useNavigate();

  const setInfo = useCallback(
    async (verbose?: { title?: string; description?: string }) => {
      if (!rnp) {
        return;
      }

      const values = getValues();

      const logo = values.logo
        ? {
            content: [...new Uint8Array(await values.logo.arrayBuffer())],
            mime_type: values.logo.type,
          }
        : null;

      const encoded = walletEncoder.update_info({
        new_info: {
          name: values.name,
          description: values.description,
          logo: logo ? [logo] : [],
        },
      });

      const payload: ExternalExecutorFormData = {
        title: verbose?.title || 'Set wallet info',
        description: verbose?.description || 'Set wallet info',
        rnp,
        program: [
          {
            endpoint: {
              canister_id: principal,
              method_name: 'update_info',
            },
            cycles: '0',
            args_encoded: [...new Uint8Array(encoded)],
            args_candid: [],
          },
        ],
      };

      nav(`/wallet/${principal}/execute`, { state: payload });
    },
    [getValues, principal, rnp],
  );

  return {
    setInfo,
  };
};

export const useGetInfo = () => {
  const { principal } = useCurrentWallet();
  const { canister, fetching, data } = useWallet(principal);

  useEffect(() => {
    canister.get_info();
  }, []);

  return {
    fetching: !!fetching.get_info,
    data: data.get_info?.info,
  };
};
