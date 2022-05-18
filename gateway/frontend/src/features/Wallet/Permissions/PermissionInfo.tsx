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

export interface PermissionInfoProps {
  className?: string;
  style?: React.CSSProperties;
  permissionId: bigint;
  to?: To;
}

export const PermissionInfo = styled(({ permissionId, to, ...p }: PermissionInfoProps) => {
  const { principal } = useCurrentUnion();
  const { canister, data, fetching } = useUnion(principal);

  useEffect(() => {
    canister.get_permission({ id: permissionId });
  }, []);

  if (fetching.get_permission) {
    return <Spinner size={20} {...p} />;
  }

  const permission = data.get_permission?.permission;

  if (!permission) {
    return null;
  }

  return (
    <Container {...p}>
      {to ? (
        <Text variant='p2' as={NavLink} to={to}>
          {permission.name}
        </Text>
      ) : (
        <Text variant='p2'>{permission.name}</Text>
      )}
      <Text variant='p3'>{permission.description}</Text>
    </Container>
  );
})``;
