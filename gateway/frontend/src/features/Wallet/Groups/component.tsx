import React from 'react';
import styled from 'styled-components';
import { PageWrapper, Pager, Row as R, Button as B } from '@union/components';
import { Group } from 'union-ts';
import { useUnion } from 'services';
import { NavLink, useParams } from 'react-router-dom';
import { useCurrentUnion } from '../context';
import { GroupItem } from './GroupItem';

const Button = styled(B)``;
const Controls = styled(R)`
  justify-content: flex-end;
`;

const Container = styled(PageWrapper)`
  ${Controls} {
    margin-bottom: 16px;
  }
`;

export interface GroupsProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Groups = styled(({ ...p }: GroupsProps) => {
  const { groupId } = useParams();
  const { principal } = useCurrentUnion();
  const { canister } = useUnion(principal);

  return (
    <Container {...p} title='Groups'>
      <Controls>
        <Button forwardedAs={NavLink} to='create'>
          +
        </Button>
      </Controls>
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
        renderItem={(group: Group) => (
          <GroupItem group={group} opened={groupId == String(group.id[0])} />
        )}
      />
    </Container>
  );
})``;
