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

export type AccessConfigInfoProps = {
  className?: string;
  style?: React.CSSProperties;
  to?: To;
  accessConfigId: bigint;
};

export const AccessConfigInfo = styled(({ accessConfigId, to, ...p }: AccessConfigInfoProps) => {
  const { principal } = useCurrentUnion();
  const { canister, data, fetching } = useUnion(principal);

  useEffect(() => {
    canister.get_access_config({ id: accessConfigId, query_delegation_proof_opt: [] });
  }, []);

  if (fetching.get_access_config) {
    return <Spinner size={20} {...p} />;
  }

  const config = data.get_access_config?.access_config;

  if (!config) {
    return null;
  }

  return (
    <Container {...p}>
      {to ? (
        <Text variant='p3' as={NavLink} to={to}>
          {config.name}
        </Text>
      ) : (
        <Text variant='p3'>{config.name}</Text>
      )}
      <Text variant='p3'>{config.description}</Text>
    </Container>
  );
})``;
