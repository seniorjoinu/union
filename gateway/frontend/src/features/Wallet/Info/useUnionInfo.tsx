import { Principal } from '@dfinity/principal';
import React, { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gatewaySerializer, useUnion, walletEncoder } from 'services';
import { ExternalExecutorFormData } from '../../Executor';
import { useCurrentUnion } from '../context';

export interface SetInfoFormData {
  name: string;
  description: string;
  logo: Blob | File | null;
}

export interface UseSetInfoProps {
  getValues(): SetInfoFormData;
}

export const useSetInfo = ({ getValues }: UseSetInfoProps) => {
  const { principal, rnp } = useCurrentUnion();
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
        program: {
          RemoteCallSequence: [
            {
              endpoint: {
                canister_id: principal,
                method_name: 'update_info',
              },
              cycles: BigInt(0),
              args: { Encoded: [...new Uint8Array(encoded)] },
            },
          ],
        },
      };

      nav(`/wallet/${principal}/execute`, { state: payload });
    },
    [getValues, principal, rnp],
  );

  return {
    setInfo,
  };
};

export interface UpgradeFormData {
  version: string;
}

export interface UseUpgradeWalletProps {
  getValues(): UpgradeFormData;
}

export const useUpgradeWallet = ({ getValues }: UseUpgradeWalletProps) => {
  const { principal, rnp } = useCurrentUnion();
  const nav = useNavigate();

  const upgradeWalletVersion = useCallback(
    async (verbose?: { title?: string; description?: string }) => {
      if (!rnp) {
        return;
      }

      const { version } = getValues();

      const payload: ExternalExecutorFormData = {
        title: verbose?.title || 'Upgrade wallet binary',
        description: verbose?.description || `Upgrade wallet binary to version "${version}"`,
        rnp,
        program: {
          RemoteCallSequence: [
            {
              endpoint: {
                canister_id: Principal.from(process.env.GATEWAY_CANISTER_ID),
                method_name: 'upgrade_union_wallet',
              },
              cycles: BigInt(0),
              args: {
                CandidString: gatewaySerializer.upgrade_union_wallet({
                  new_version: version,
                }),
              },
            },
          ],
        },
      };

      nav(`/wallet/${principal}/execute`, { state: payload });
    },
    [getValues, principal, rnp],
  );

  return {
    upgradeWalletVersion,
  };
};

export const useGetInfo = () => {
  const { principal } = useCurrentUnion();
  const { canister, fetching, data } = useUnion(principal);

  useEffect(() => {
    canister.get_info();
  }, []);

  return {
    fetching: !!fetching.get_info,
    data: data.get_info?.info,
  };
};
