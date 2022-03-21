import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Text } from 'components';
import { Role, RoleType, Permission } from 'wallet-ts';
import { useWallet } from '../../services/controllers';
import { useCurrentWallet } from './context';

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
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const { data, canister, fetching } = useWallet(principal);
  const { rnp } = useCurrentWallet();

  useEffect(() => {
    if (!rnp) {
      return;
    }

    if (!data.get_permissions_attached_to_roles) {
      return canister.get_permissions_attached_to_roles({ rnp, role_ids: [role.id] });
    }

    const { result } = data.get_permissions_attached_to_roles;
    const ids = result.map(([_, permissionId]) => permissionId);

    canister.get_permissions({ rnp, ids });
  }, [rnp, data.get_permissions_attached_to_roles, setPermissions]);

  const progress = !!fetching.get_permissions_attached_to_roles || !!fetching.get_permissions;

  return (
    <Container>
      <Title variant='p1'>{parseRole(role.role_type).title}</Title>
      <span>{JSON.stringify(role)}</span>
      {progress && <span>fetching</span>}
      <span>{JSON.stringify(permissions)}</span>
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
