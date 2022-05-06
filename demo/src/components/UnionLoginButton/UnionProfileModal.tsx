import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useUnion } from '../../union';
import { ProfileModal, ProfileModalData } from '../ProfileModal';

export interface UnionProfileModalProps {
  className?: string;
  style?: React.CSSProperties;
  visible: boolean;
  onClose(): void;
}

export const UnionProfileModal = ({ visible, onClose, ...p }: UnionProfileModalProps) => {
  const { execute, client, refresh } = useUnion();

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

  if (!client.union) {
    return null;
  }

  return (
    <ProfileModal
      {...p}
      principal={client.union}
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
