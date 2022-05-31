import { Principal } from '@dfinity/principal';
import { SubmitButton } from '@union/components';
import { HAS_PROFILE_GROUP_ID } from 'envs';
import React, { useCallback, useEffect } from 'react';
import { useUnion } from 'services';
import styled from 'styled-components';
import { Choice, Voting } from 'union-ts';

const Button = styled(SubmitButton)``;

export interface CastVoteProps {
  className?: string;
  style?: React.CSSProperties;
  unionId: Principal;
  voting: Voting;
  onVoted(): void;
}

export const CastVote = styled(({ unionId, onVoted, voting, ...p }: CastVoteProps) => {
  const { canister, data, fetching } = useUnion(unionId);

  useEffect(() => {
    // canister.get_my_vote({})
  }, []);

  // onVoted
  const submit = useCallback(
    async (choice: Choice) => {
      // choice.

      const approval = voting.approval_choice[0];
      const rejection = voting.rejection_choice[0];
      const { shares_info } = await canister.get_my_shares_info_at({
        group_id: HAS_PROFILE_GROUP_ID,
        at: voting.created_at,
      });

      if (!shares_info.length) {
        throw 'Shares not found';
      }

      if (approval == choice.id[0]) {
        await canister.cast_my_vote({
          id: voting.id[0]!,
          vote: {
            Approval: {
              shares_info: shares_info[0],
            },
          },
        });
      } else if (rejection == choice.id[0]) {
        await canister.cast_my_vote({
          id: voting.id[0]!,
          vote: {
            Rejection: {
              shares_info: shares_info[0],
            },
          },
        });
      } else {
        throw 'Unknown vote';
      }
      // choice.
      //   export type Vote = { 'Rejection' : SingleChoiceVote } |
      // { 'Approval' : SingleChoiceVote } |
      // { 'Common' : MultiChoiceVote };
      onVoted();
    },
    [onVoted, canister, voting],
  );

  return <span>cast</span>;
})``;
