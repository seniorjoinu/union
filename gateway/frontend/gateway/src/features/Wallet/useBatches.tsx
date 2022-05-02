import { useCallback } from 'react';
import { useWallet, walletSerializer } from 'services';
import { useNavigate } from 'react-router-dom';
import { checkPrincipal } from 'toolkit';
import { Principal } from '@dfinity/principal';
import { ExternalExecutorFormData } from '../Executor';
import { useCurrentWallet } from './context';

export function useBatches() {
  const nav = useNavigate();
  const { rnp, principal } = useCurrentWallet();
  const { canister, fetching } = useWallet(principal);

  const remove = useCallback(
    async (batchIds: bigint[], verbose?: { title?: string; description?: string }) => {
      if (!rnp) {
        return;
      }

      const payload: ExternalExecutorFormData = {
        title: verbose?.title || 'Delete locked batches',
        description: verbose?.description || `Delete locked batches with ids ${batchIds.join()}`,
        rnp,
        program: {
          RemoteCallSequence: [
            {
              endpoint: {
                canister_id: principal,
                method_name: 'delete_batches',
              },
              cycles: BigInt(0),
              args: {
                CandidString: walletSerializer.delete_batches({
                  batch_ids: batchIds,
                }),
              },
            },
          ],
        },
      };

      nav(`/wallet/${principal}/execute`, { state: payload });
    },
    [canister, fetching, rnp],
  );

  const send = useCallback(
    async (
      batchIds: bigint[],
      targetCanister: string,
      verbose?: { title?: string; description?: string },
    ) => {
      if (!rnp) {
        return;
      }

      const canisterId = checkPrincipal(targetCanister);

      if (!canisterId) {
        return;
      }

      const payload: ExternalExecutorFormData = {
        title: verbose?.title || 'Send batches to canister',
        description:
          verbose?.description || `Send batches ${batchIds.join()} to canister ${targetCanister}`,
        rnp,
        program: {
          RemoteCallSequence: [
            ...batchIds.map((batchId) => ({
              endpoint: {
                canister_id: Principal.from(principal),
                method_name: 'send_batch',
              },
              cycles: BigInt(0),
              args: {
                CandidString: walletSerializer.send_batch({
                  batch_id: batchId,
                  target_canister: canisterId,
                }),
              },
            })),
          ],
        },
      };
      // const payload: ExternalExecutorFormData = {
      //   title: verbose?.title || 'Send batches to canister and delete them',
      //   description:
      //     verbose?.description ||
      //     `Send batches ${batchIds.join()} to canister ${targetCanister} and delete them`,
      //   rnp,
      //   program: {RemoteCallSequence: [
      //     ...batchIds.map((batchId) => ({
      //       endpoint: {
      //         canister_id: principal,
      //         method_name: 'send_batch',
      //       },
      //       cycles: '0',
      //       args_candid: walletSerializer.send_batch({
      //         batch_id: batchId,
      //         target_canister: canisterId,
      //       }),
      //     })),
      //     {
      //       endpoint: {
      //         canister_id: principal,
      //         method_name: 'delete_batches',
      //       },
      //       cycles: '0',
      //       args_candid: walletSerializer.delete_batches({
      //         batch_ids: batchIds,
      //       }),
      //     },
      //   ]},
      // };

      nav(`/wallet/${principal}/execute`, { state: payload });
    },
    [canister, fetching, rnp],
  );

  return {
    remove,
    send,
  };
}
