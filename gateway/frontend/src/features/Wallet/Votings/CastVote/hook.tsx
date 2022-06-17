import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Principal } from '@dfinity/principal';
import { useUnion } from 'services';
import { Choice, Group, SharesInfo, ThresholdValue } from 'union-ts';
import { getGroupsFromThresholds } from './utils';

export interface UseChoicesProps {
  unionId: Principal;
  votingId: bigint;
  choiceInfos: { choice_id: bigint; choice?: Choice; thresholds: ThresholdValue[] }[];
  at: bigint;
}

type Info = { group: Group; group_id: bigint; shares_info: SharesInfo };

export const useChoices = ({ unionId, choiceInfos, votingId, at }: UseChoicesProps) => {
  const [shareInfos, setShareInfos] = useState<Info[] | null>(null);
  const [choices, setChoices] = useState<Choice[] | null>(null);
  const { canister } = useUnion(unionId);

  useEffect(() => {
    Promise.all(
      choiceInfos.map(async ({ choice_id, choice }) => {
        if (choice) {
          return choice;
        }
        const res = await canister.get_voting_choice({
          choice_id,
          voting_id: { Common: votingId },
          query_delegation_proof_opt: [],
        });

        return res.choice;
      }),
    ).then(setChoices);
  }, [choiceInfos]);

  const groups = useMemo(
    () =>
      choiceInfos.reduce(
        (acc, info) => ({
          ...acc,
          [Number(info.choice_id)]: info.thresholds.map((t) => getGroupsFromThresholds(t)).flat(),
        }),
        {} as Record<number, bigint[]>,
      ),
    [choiceInfos],
  );

  useEffect(() => {
    const groupsByIds = choiceInfos.map(({ choice_id }) => groups[Number(choice_id)] || []).flat();
    const allGroups = new Set(groupsByIds);

    Promise.all(
      Array.from(allGroups).map(async (group_id) => {
        const { group } = await canister.get_group({ group_id, query_delegation_proof_opt: [] });
        const { shares_info } = await canister.get_my_shares_info_at({
          group_id,
          at,
        });

        return { group: group.it, group_id, shares_info: shares_info[0] };
      }),
    )
      .then((shareInfos) => shareInfos.filter((s): s is Info => !!s.shares_info))
      .then(setShareInfos);
  }, [groups, setShareInfos, choiceInfos, at]);

  const getShareInfo = useCallback(
    (choiceId: bigint | undefined) => {
      if (typeof choiceId == 'undefined') {
        return [];
      }
      const groupIds = groups[Number(choiceId)] || [];

      return (shareInfos || []).filter((s) => groupIds.includes(s.group_id));
    },
    [groups, shareInfos],
  );

  return {
    getShareInfo,
    choices,
    shareInfos,
  };
};
