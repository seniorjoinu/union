import React, { useEffect } from 'react';
import styled from 'styled-components';
import { PageWrapper, Pager } from '@union/components';
import { useUnion } from 'services';
import { Permission } from 'union-ts';
import { useCurrentUnion } from '../context';
import { PermissionItem } from './PermissionItem';

const Container = styled(PageWrapper)``;

export interface PermissionsProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Permissions = styled(({ ...p }: PermissionsProps) => {
  const { principal } = useCurrentUnion();
  const { canister } = useUnion(principal);

  return (
    <Container {...p} title='Permissions'>
      <Pager
        size={5}
        fetch={({ index, size }) =>
          canister.list_permissions({
            page_req: {
              page_index: index,
              page_size: size,
              sort: null,
              filter: { target: [] },
            },
          })
        }
        renderItem={(item: Permission) => <PermissionItem permission={item} />}
      />
    </Container>
  );
})``;
