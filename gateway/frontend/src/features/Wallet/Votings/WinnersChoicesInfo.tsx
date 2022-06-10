import { Principal } from '@dfinity/principal';
import { Column, Field, TextVariant, withBorder } from '@union/components';
import React, { useEffect, useMemo } from 'react';
import { useUnion } from 'services';
import styled from 'styled-components';
import { Voting } from 'union-ts';
import { ChoiceItem as CI } from './CastVote/ChoiceItem';

const Container = styled(Column)``;
const ChoiceItem = withBorder(
  styled(CI)`
    padding: 8px;
  `,
  { withQuad: false },
);

export interface WinnersChoicesInfoProps {
  className?: string;
  style?: React.CSSProperties;
  voting: Voting;
  unionId: Principal;
  variant?: TextVariant;
}

export const WinnersChoicesInfo = styled(
  ({ unionId, voting, variant, ...p }: WinnersChoicesInfoProps) => {
    const { canister, data } = useUnion(unionId);

    useEffect(() => {
      canister.get_voting_results({ voting_id: voting.id[0]!, query_delegation_proof_opt: [] });
    }, []);

    const winners = useMemo(() => voting.winners.map((w) => w.choices).flat(), [voting]);
    const results = data.get_voting_results?.results || [];

    if (!winners.length) {
      return null;
    }

    return (
      <Field
        title='Winners'
        weight={{ title: 'medium' }}
        variant={{ title: variant || 'p3' }}
        {...p}
      >
        <Container>
          {winners.map((choiceId) => (
            <ChoiceItem
              key={String(choiceId)}
              unionId={unionId}
              voting={voting}
              choice={choiceId}
              results={results.find((r) => r[0] == choiceId)?.[1]}
            />
          ))}
        </Container>
      </Field>
    );
  },
)``;
