import { useCallback } from 'react';
import { useUnion, unionSerializer } from 'services';
import { useNavigate } from 'react-router-dom';
import { checkPrincipal } from 'toolkit';
import { Principal } from '@dfinity/principal';
import { useCurrentUnion } from './context';

export function useBatches() {
  const nav = useNavigate();
  const { principal } = useCurrentUnion();
  const { canister, fetching } = useUnion(principal);

  const remove = useCallback(
    async (batchIds: bigint[], verbose?: { title?: string; description?: string }) => {
      // const payload: ExternalExecutorFormData = {
      //   program: {
      //     RemoteCallSequence: [
      //       {
      //         endpoint: {
      //           canister_id: principal,
      //           method_name: 'delete_batches',
      //         },
      //         cycles: BigInt(0),
      //         args: {
      //           CandidString: unionSerializer.delete_batches({
      //             batch_ids: batchIds,
      //           }),
      //         },
      //       },
      //     ],
      //   },
      // };
      // nav(`/wallet/${principal}/execute`, { state: payload });
    },
    [canister, fetching],
  );

  const send = useCallback(
    async (
      batchIds: bigint[],
      targetCanister: string,
      removeBatches?: boolean,
      verbose?: { title?: string; description?: string },
    ) => {
      const canisterId = checkPrincipal(targetCanister);

      if (!canisterId) {
      }

      // const payload: ExternalExecutorFormData = {
      //   title: verbose?.title || 'Send batches to canister',
      //   description:
      //     verbose?.description || `Send batches ${batchIds.join()} to canister ${targetCanister}`,
      //   rnp,
      //   program: {
      //     RemoteCallSequence: [
      //       ...batchIds.map((batchId) => ({
      //         endpoint: {
      //           canister_id: Principal.from(principal),
      //           method_name: 'send_batch',
      //         },
      //         cycles: BigInt(0),
      //         args: {
      //           CandidString: unionSerializer.send_batch({
      //             batch_id: batchId,
      //             target_canister: canisterId,
      //           }),
      //         },
      //       })),
      //       ...(removeBatches
      //         ? [
      //             {
      //               endpoint: {
      //                 canister_id: principal,
      //                 method_name: 'delete_batches',
      //               },
      //               cycles: BigInt(0),
      //               args: {
      //                 CandidString: unionSerializer.delete_batches({
      //                   batch_ids: batchIds,
      //                 }),
      //               },
      //             },
      //           ]
      //         : []),
      //     ],
      //   },
      // };

      // nav(`/wallet/${principal}/execute`, { state: payload });
    },
    [canister, fetching],
  );

  return {
    remove,
    send,
  };
}
