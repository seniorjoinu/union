import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useUnion } from 'services';
import { Spinner, Column, Text, Row } from '@union/components';
import { NavLink } from 'react-router-dom';
import { To } from 'history';
import { Principal } from '@dfinity/principal';

const Children = styled(Row)``;
const Container = styled(Column)`
  & > ${Text} {
    margin-left: 8px;
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
  choiceId: bigint;
  children?: React.ReactNode;
} & Ids;

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
  ({ unionId, choiceId, votingId, nestedVotingId, to, children, ...p }: ChoiceInfoProps) => {
    const { canister, data, fetching } = useUnion(unionId);

    useEffect(() => {
      canister.get_voting_choice({
        choice_id: choiceId,
        voting_id:
          typeof votingId !== 'undefined'
            ? { Common: votingId }
            : { Nested: nestedVotingId || BigInt(-1) },
        query_delegation_proof_opt: [],
      });
    }, [choiceId]);

    if (fetching.get_voting_choice) {
      return <Spinner size={20} {...p} />;
    }

    const choice = data.get_voting_choice?.choice;

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
