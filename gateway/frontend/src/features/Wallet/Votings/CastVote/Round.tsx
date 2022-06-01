import React from 'react';
import styled from 'styled-components';
import { Principal } from '@dfinity/principal';
import { Column, Spinner, SubmitButton } from '@union/components';
import { Voting, VotingConfig } from 'union-ts';

const Container = styled(Column)``;

export interface RoundProps {
  className?: string;
  style?: React.CSSProperties;
  unionId: Principal;
  voting: Voting;
  votingConfig: VotingConfig;
  onVoted(): void;
}

export const Round = styled(({ unionId, onVoted, voting, ...p }: RoundProps) => <Container>cast</Container>)``;
