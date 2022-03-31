import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { walletSerializer } from '../../../services';
import { ExternalExecutorFormData } from '../../Executor';
import { useCurrentWallet } from '../context';

export interface ProfileFormData {
  name: string;
  description: string;
}

export const useEditProfile = () => {
  const { rnp, principal } = useCurrentWallet();
  const nav = useNavigate();

  const editProfile = useCallback(
    (roleId: number, data: ProfileFormData, old: ProfileFormData) => {
      if (!rnp) {
        return;
      }

      const payload: ExternalExecutorFormData = {
        title: 'Edit profile',
        description: `Edit profile with id=${roleId}`,
        rnp,
        program: [
          {
            endpoint: {
              canister_id: principal,
              method_name: 'edit_profile',
            },
            cycles: '0',
            args_candid: walletSerializer.edit_profile({
              role_id: Number(roleId),
              new_name: old.name !== data.name ? [data.name] : [],
              new_description: old.description !== data.description ? [data.description] : [],
            }),
          },
        ],
      };

      nav(`/wallet/${principal}/execute`, { state: payload });
    },
    [rnp],
  );

  return {
    editProfile,
  };
};
