import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Text } from 'components';
import { Permission } from 'wallet-ts';
import { useWallet } from '../../services/controllers';

const Title = styled(Text)``;

const Container = styled.div`
  display: flex;
  flex-direction: column;

  ${Title} {
    margin-bottom: 8px;
  }
`;

export interface PermissionInfoProps {
  permission: Permission;
  principal: string;
}

export const PermissionInfo = ({ principal, permission }: PermissionInfoProps) => {
  // const [roles, setRoles] = useState<Role[]>([]);
  const { canister, fetching } = useWallet(principal);

  useEffect(() => {}, []);

  return <Container>{JSON.stringify(permission)}</Container>;
};
