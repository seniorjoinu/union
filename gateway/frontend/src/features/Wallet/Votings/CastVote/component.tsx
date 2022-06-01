import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Principal } from '@dfinity/principal';
import styled from 'styled-components';
import { Voting } from 'union-ts';
import { useUnion } from 'services';
import { Column, Spinner } from '@union/components';
import { Round0 } from './Round0';
import { Round } from './Round';
import { getGroupsFromThresholds } from './utils';
import { Results } from './Results';

const Container = styled(Column)`
  & > ${Spinner} {
    align-self: center;
  }

  ${Results} {
    margin-bottom: 16px;
  }
`;

export interface CastVoteProps {
  className?: string;
  style?: React.CSSProperties;
  unionId: Principal;
  voting: Voting;
  onVoted(): void;
}

export const CastVote = styled(({ voting, onVoted, ...p }: CastVoteProps) => {
  const { canister, data } = useUnion(p.unionId);
  const [votes, setVotes] = useState<[bigint, bigint][]>([]);

  useEffect(() => {
    refresh();
  }, []);

  const refresh = useCallback(async () => {
    const { voting_config } = await canister.get_voting_config({
      id: voting.voting_config_id,
      query_delegation_proof_opt: [],
    });
    const groups = new Set([
      ...getGroupsFromThresholds(voting_config.approval),
      ...getGroupsFromThresholds(voting_config.rejection),
      ...getGroupsFromThresholds(voting_config.quorum),
      ...getGroupsFromThresholds(voting_config.win),
      ...getGroupsFromThresholds(voting_config.next_round),
    ]);
    const votes = await Promise.all(
      Array.from(groups).map(async (group_id) => {
        const { vote } = await canister.get_my_vote({ voting_id: voting.id[0]!, group_id });

        return vote;
      }),
    ).then((votes) => votes.flat());

    await canister.get_voting_results({
      voting_id: voting.id[0]!,
      query_delegation_proof_opt: [],
    });

    setVotes(votes);
  }, [voting, setVotes]);

  const votingConfig = useMemo(() => data.get_voting_config?.voting_config, [
    data.get_voting_config,
  ]);

  const handleVoted = useCallback(async () => {
    await refresh();
    onVoted();
  }, [onVoted, refresh]);

  if (!votingConfig) {
    return (
      <Container {...p}>
        <Spinner size={15} />
      </Container>
    );
  }

  return (
    <Container {...p}>
      <Results
        unionId={p.unionId}
        results={data.get_voting_results?.results || []}
        voting={voting}
      />
      {'Round' in voting.status && voting.status.Round == 0 && (
        <Round0
          {...p}
          onVoted={handleVoted}
          votes={votes}
          votingConfig={votingConfig}
          voting={voting}
        />
      )}
      {'Round' in voting.status && voting.status.Round !== 0 && (
        <Round {...p} onVoted={handleVoted} votingConfig={votingConfig} voting={voting} />
      )}
    </Container>
  );
})``;
