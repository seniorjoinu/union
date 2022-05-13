import React from 'react';
import styled from 'styled-components';
import { PageWrapper, Pager } from '@union/components';
import { Group } from 'union-ts';
import { useUnion } from 'services';
import { useCurrentUnion } from '../context';
import { GroupItem } from './GroupItem';

const Container = styled(PageWrapper)``;

export interface GroupsProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Groups = styled(({ ...p }: GroupsProps) => {
  const { principal } = useCurrentUnion();
  const { canister } = useUnion(principal);

  return (
    <Container {...p} title='Groups'>
      <Pager
        size={5}
        fetch={({ index, size }) =>
          canister.list_groups({
            page_req: {
              page_index: index,
              page_size: size,
              filter: null,
              sort: null,
            },
          })
        }
        renderItem={(group: Group) => <GroupItem group={group} />}
      />
    </Container>
  );
})``;
