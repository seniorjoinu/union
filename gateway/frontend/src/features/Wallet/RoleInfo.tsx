import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Text } from 'components';
import { Role, RoleType } from 'wallet-ts';
import { useWallet } from '../../services/controllers';

const Title = styled(Text)``;

const Container = styled.div`
  display: flex;
  flex-direction: column;

  ${Title} {
    margin-bottom: 8px;
  }
`;

export interface RoleInfoProps {
  role: Role;
  principal: string;
}

export const RoleInfo = ({ principal, role }: RoleInfoProps) => {
  // const [roles, setRoles] = useState<Role[]>([]);
  const { canister, fetching } = useWallet(principal);

  useEffect(() => {
    canister.get_permissions_attached_to_roles;
  }, []);

  return (
    <Container>
      <Title variant='p1'>{parseRole(role.role_type).title}</Title>
      <span>{JSON.stringify(role)}</span>
    </Container>
  );
};

type ParsedRoleType = {
  title: string;
  description: string;
};

const parseRole = (type: RoleType): ParsedRoleType => {
  if ('Profile' in type) {
    return {
      title: type.Profile.name,
      description: type.Profile.description,
    };
  }
  if ('FractionOf' in type) {
    return {
      title: type.FractionOf.name,
      description: type.FractionOf.description,
    };
  }
  if ('Everyone' in type) {
    return {
      title: 'Общее собрание',
      description: '',
    };
  }
  if ('QuantityOf' in type) {
    return {
      title: type.QuantityOf.name,
      description: type.QuantityOf.description,
    };
  }

  return { title: 'Unknown', description: '' };
};
