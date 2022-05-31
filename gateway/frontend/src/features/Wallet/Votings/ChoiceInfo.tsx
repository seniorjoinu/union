import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useUnion } from 'services';
import { Spinner, Column, Text, Row } from '@union/components';
import { NavLink } from 'react-router-dom';
import { To } from 'history';
import { Principal } from '@dfinity/principal';
import { Choice } from 'union-ts';

const Children = styled(Row)``;
const Container = styled(Column)`
  & > ${Text} {
    margin-bottom: 2px;

    &:first-child {
      cursor: pointer;
      transition: color 0.2s ease;
      color: ${({ theme }) => theme.colors.dark};

      &:hover {
        color: ${({ theme }) => theme.colors.grey};
      }
    }

    &:last-child {
      color: ${({ theme }) => theme.colors.grey};
    }
  }
`;

export type ChoiceInfoProps = {
  className?: string;
  style?: React.CSSProperties;
  to?: To;
  unionId: Principal;
  children?: React.ReactNode;
} & Choices;

export type Choices =
  | (Ids & {
      choiceId: bigint;
      choice?: never;
    })
  | {
      choiceId?: never;
      choice: Choice;
      votingId?: never;
      nestedVotingId?: never;
    };

export type Ids =
  | ({} & {
      votingId: bigint;
      nestedVotingId?: bigint;
    })
  | ({} & {
      votingId?: bigint;
      nestedVotingId: bigint;
    });

export const ChoiceInfo = styled(
  ({
    unionId,
    choiceId,
    choice: propChoice,
    votingId,
    nestedVotingId,
    to,
    children,
    ...p
  }: ChoiceInfoProps) => {
    const { canister, data, fetching } = useUnion(unionId);

    useEffect(() => {
      if (typeof choiceId == 'bigint') {
        canister.get_voting_choice({
          choice_id: choiceId,
          voting_id:
            typeof votingId !== 'undefined'
              ? { Common: votingId }
              : { Nested: nestedVotingId || BigInt(-1) },
          query_delegation_proof_opt: [],
        });
      }
    }, [choiceId]);

    if (fetching.get_voting_choice) {
      return <Spinner size={20} {...p} />;
    }

    const choice = propChoice || data.get_voting_choice?.choice;

    if (!choice) {
      return null;
    }

    return (
      <Container {...p}>
        {to ? (
          <Text variant='p2' as={NavLink} to={to}>
            {choice.name}
          </Text>
        ) : (
          <Text variant='p2'>{choice.name}</Text>
        )}
        <Text variant='p3' color='grey'>
          {choice.description}
        </Text>
        {children && <Children>{children}</Children>}
      </Container>
    );
  },
)``;
