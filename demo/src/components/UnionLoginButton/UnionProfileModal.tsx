import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useUnionWallet } from '../../union';
import { ProfileModal, ProfileModalData } from '../ProfileModal';

export interface UnionProfileModalProps {
  className?: string;
  style?: React.CSSProperties;
  visible: boolean;
  onClose(): void;
}

export const UnionProfileModal = ({ visible, onClose, ...p }: UnionProfileModalProps) => {
  const { execute, client, refresh } = useUnionWallet();

  const handleSubmit = useCallback(
    async (data: ProfileModalData) => {
      if (!data.name) {
        return;
      }

      execute('edit_profile', [{ name: data.name }], {
        title: 'Change profile name on Thoughter',
        description: 'Change profile name',
      });
      onClose();
    },
    [onClose, execute],
  );

  if (!client.wallet) {
    return null;
  }

  return (
    <ProfileModal
      {...p}
      principal={client.wallet}
      onSubmit={handleSubmit}
      visible={visible}
      onLogout={() => {
        client.logout();
        refresh();
      }}
      onClose={onClose}
    />
  );
};
