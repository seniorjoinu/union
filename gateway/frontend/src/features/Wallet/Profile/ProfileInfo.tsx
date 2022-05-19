import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useUnion } from 'services';
import { Spinner, Column, Text, Row, Chips } from '@union/components';
import { NavLink } from 'react-router-dom';
import { To } from 'history';
import { caseByCount } from 'toolkit';
import { Principal } from '@dfinity/principal';
import { useCurrentUnion } from '../context';

const Params = styled(Row)`
  align-items: center;

  ${Text}:first-child {
    cursor: pointer;
    transition: color 0.2s ease;
    color: ${({ theme }) => theme.colors.dark};

    &:hover {
      color: ${({ theme }) => theme.colors.grey};
    }
  }
`;

const Container = styled(Column)`
  ${Params} {
    margin-bottom: 2px;
  }
  & > ${Text} {
    color: ${({ theme }) => theme.colors.grey};
  }
`;

export interface ProfileInfoProps {
  className?: string;
  style?: React.CSSProperties;
  profileId: Principal;
  to?: To;
  mode?: 'short' | 'long';
}

export const ProfileInfo = styled(({ profileId, to, mode = 'short', ...p }: ProfileInfoProps) => {
  const { principal } = useCurrentUnion();
  const { canister, data, fetching } = useUnion(principal);

  useEffect(() => {
    canister.get_profile({ id: profileId, query_delegation_proof_opt: [] });
  }, []);

  if (fetching.get_profile) {
    return <Spinner size={20} {...p} />;
  }

  const profile = data.get_profile?.profile;

  if (!profile) {
    return (
      <Container {...p}>
        <Text variant='p2'>{profileId.toString()}</Text>
      </Container>
    );
  }

  return (
    <Container {...p}>
      <Params>
        <Text variant='p2' as={to ? NavLink : undefined} to={to!}>
          {profileId.toString()}
        </Text>
        <Chips variant='caption' weight='medium'>
          {profile.name}
        </Chips>
      </Params>
      {mode == 'long' && <Text variant='p3'>{profile.description}</Text>}
    </Container>
  );
})``;
