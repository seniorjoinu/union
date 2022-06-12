import React, { useCallback } from 'react';
import { useUnion } from '../../union';
import { ProfileModal, ProfileModalData } from '../ProfileModal';

export interface UnionProfileModalProps {
  className?: string;
  style?: React.CSSProperties;
  visible: boolean;
  onClose(): void;
}

export const UnionProfileModal = ({ visible, onClose, ...p }: UnionProfileModalProps) => {
  const { getProgram, client, refresh } = useUnion();

  const handleSubmit = useCallback(
    async (data: ProfileModalData) => {
      if (!data.name.length) {
        return;
      }

      const program = getProgram([
        [
          'edit_profile',
          [
            {
              name: data.name,
              union_access_config_id: data.unionAccessConfigId,
              union_group_id: data.unionGroupId,
            },
          ],
        ],
      ]);

      client.createVoting({
        voting: {
          name: 'Changing our name on Thoughter',
          description: 'We want to change our public name',
          winners_need: 1,
        },
        choices: [
          {
            name: data.name[0],
            description: 'I agree with that name',
            program,
          },
        ],
      });
      onClose();
    },
    [onClose, getProgram, client],
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
