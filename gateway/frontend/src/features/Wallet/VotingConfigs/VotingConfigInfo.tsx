import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useUnion } from 'services';
import { Spinner, Column, Text } from '@union/components';
import { NavLink } from 'react-router-dom';
import { To } from 'history';
import { useCurrentUnion } from '../context';

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

export type VotingConfigInfoProps = {
  className?: string;
  style?: React.CSSProperties;
  to?: To;
} & Ids;

export type Ids =
  | ({} & {
      votingConfigId: bigint;
      nestedVotingConfigId?: bigint;
    })
  | ({} & {
      votingConfigId?: bigint;
      nestedVotingConfigId: bigint;
    });

export const VotingConfigInfo = styled(
  ({ votingConfigId, nestedVotingConfigId, to, ...p }: VotingConfigInfoProps) => {
    const { principal } = useCurrentUnion();
    const { canister, data, fetching } = useUnion(principal);

    useEffect(() => {
      if (typeof votingConfigId !== 'undefined') {
        canister.get_voting_config({ id: votingConfigId, query_delegation_proof_opt: [] });
      } else if (typeof nestedVotingConfigId !== 'undefined') {
        canister.get_nested_voting_config({
          id: nestedVotingConfigId,
          query_delegation_proof_opt: [],
        });
      }
    }, []);

    if (fetching.get_voting_config || fetching.get_nested_voting_config) {
      return <Spinner size={20} {...p} />;
    }

    const config =
      data.get_voting_config?.voting_config || data.get_nested_voting_config?.nested_voting_config;

    if (!config) {
      return null;
    }

    return (
      <Container {...p}>
        {to ? (
          <Text variant='p2' as={NavLink} to={to}>
            {config.name}
          </Text>
        ) : (
          <Text variant='p2'>{config.name}</Text>
        )}
        <Text variant='p3'>{config.description}</Text>
      </Container>
    );
  },
)``;
