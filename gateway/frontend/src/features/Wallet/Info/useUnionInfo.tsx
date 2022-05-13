import { Principal } from '@dfinity/principal';
import React, { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gatewaySerializer, useUnion, walletEncoder } from 'services';
import { useCurrentUnion } from '../context';

export interface SetInfoFormData {
  name: string;
  description: string;
}

export interface UseSetInfoProps {
  getValues(): SetInfoFormData;
}

export const useSetInfo = ({ getValues }: UseSetInfoProps) => {
  const { principal } = useCurrentUnion();
  const nav = useNavigate();

  const setInfo = useCallback(
    async (verbose?: { title?: string; description?: string }) => {
      const values = getValues();

      const encoded = walletEncoder.update_settings({
        new_name: [values.name],
        new_description: [values.description],
      });

      // const payload: ExternalExecutorFormData = {
      //   program: {
      //     RemoteCallSequence: [
      //       {
      //         endpoint: {
      //           canister_id: principal,
      //           method_name: 'update_info',
      //         },
      //         cycles: BigInt(0),
      //         args: { Encoded: [...new Uint8Array(encoded)] },
      //       },
      //     ],
      //   },
      // };

      // nav(`/wallet/${principal}/execute`, { state: payload });
    },
    [getValues, principal],
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
  const { principal } = useCurrentUnion();
  const nav = useNavigate();

  const upgradeWalletVersion = useCallback(
    async (verbose?: { title?: string; description?: string }) => {
      const { version } = getValues();

      // const payload: ExternalExecutorFormData = {
      //   program: {
      //     RemoteCallSequence: [
      //       {
      //         endpoint: {
      //           canister_id: Principal.from(process.env.GATEWAY_CANISTER_ID),
      //           method_name: 'upgrade_union_wallet',
      //         },
      //         cycles: BigInt(0),
      //         args: {
      //           CandidString: gatewaySerializer.upgrade_union_wallet({
      //             new_version: version,
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

  return {
    upgradeWalletVersion,
  };
};

export const useGetSettings = () => {
  const { principal } = useCurrentUnion();
  const { canister, fetching, data } = useUnion(principal);

  useEffect(() => {
    canister.get_settings();
  }, []);

  return {
    fetching: !!fetching.get_settings,
    data: data.get_settings?.settings,
  };
};
