import React, { useEffect } from 'react';
import styled from 'styled-components';
import { PageWrapper, Pager } from '@union/components';
import { useUnion } from 'services';
import { AccessConfig } from 'union-ts';
import { useCurrentUnion } from '../context';

const Container = styled(PageWrapper)``;

export interface AccessConfigsProps {
  className?: string;
  style?: React.CSSProperties;
}

export const AccessConfigs = styled(({ ...p }: AccessConfigsProps) => {
  const { principal } = useCurrentUnion();
  const { canister } = useUnion(principal);

  return (
    <Container {...p} title='Access configs'>
      <Pager
        size={5}
        fetch={({ index, size }) =>
          canister.list_access_configs({
            page_req: {
              page_index: index,
              page_size: size,
              filter: { permission: [], group: [], profile: [] },
              sort: null,
            },
          })
        }
        renderItem={(item: AccessConfig) => <span>{item.name}</span>}
      />
    </Container>
  );
})``;
