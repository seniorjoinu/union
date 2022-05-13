import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { walletSerializer } from 'services';
import { useCurrentUnion } from './context';

export function useRemove() {
  const nav = useNavigate();
  const { principal } = useCurrentUnion();

  const removePermission = useCallback(
    (permissionIds: bigint[], verbose?: { title?: string; description?: string }) => {
      // const payload: ExternalExecutorFormData = {
      //   program: {
      //     RemoteCallSequence: permissionIds.map((permissionId) => ({
      //       endpoint: {
      //         canister_id: principal,
      //         method_name: 'remove_permission',
      //       },
      //       cycles: BigInt(0),
      //       args: {
      //         CandidString: walletSerializer.delete_permission({
      //           id: permissionId,
      //         }),
      //       },
      //     })),
      //   },
      // };
      // nav(`/wallet/${principal}/execute`, { state: payload });
    },
    [nav],
  );

  return { removePermission };
}
