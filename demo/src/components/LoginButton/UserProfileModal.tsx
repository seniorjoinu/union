import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../auth';
import { useBackend } from '../../backend';
import { ProfileModal, ProfileModalData } from '../ProfileModal';

export interface UserProfileModalProps {
  className?: string;
  style?: React.CSSProperties;
  visible: boolean;
  onClose(): void;
  onSubmit(): void;
}

export const UserProfileModal = ({ visible, onClose, onSubmit, ...p }: UserProfileModalProps) => {
  const { principal, logout } = useAuth();
  const { canister, data } = useBackend();

  const refresh = useCallback(() => {
    if (!principal || principal.isAnonymous()) {
      return;
    }
    canister.get_profile(principal);
  }, [principal, canister]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const computedVisible = (!!data.get_profile && !data.get_profile.name) || visible;

  const handleSubmit = useCallback(
    async (data: ProfileModalData) => {
      if (!data.name) {
        return;
      }

      await canister.edit_profile({ name: data.name });
      refresh();
      onSubmit();
    },
    [canister, refresh, onSubmit],
  );

  if (!principal) {
    return null;
  }

  return (
    <ProfileModal
      {...p}
      principal={principal}
      onSubmit={handleSubmit}
      visible={computedVisible}
      onLogout={logout}
      onClose={onClose}
    />
  );
};
