import React, { useState } from 'react';
import styled from 'styled-components';
import { PageWrapper, Pager, Row as R, Button as B, Text, getFontStyles } from '@union/components';
import { Group } from 'union-ts';
import { useUnion } from 'services';
import { NavLink, useParams } from 'react-router-dom';
import { DEFAULT_GROUP_IDS } from 'envs';
import { UnionTooltipButtonComponent, useUnionSubmit } from '../../../components/UnionSubmit';
import { useCurrentUnion } from '../context';
import { GroupItem } from './GroupItem';

const DeleteText = styled(Text)`
  color: red;
  ${getFontStyles('p3', 'medium')}
`;

const Button = styled(B)``;
const Controls = styled(R)`
  justify-content: flex-end;

  &:empty {
    display: none;
  }
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
  const [optimisticDeleted, setOptimisticDeleted] = useState<Record<string, true>>({});
  const deleteUnionButtonProps = useUnionSubmit({
    canisterId: principal,
    methodName: 'delete_group',
    onExecuted: (p) => setOptimisticDeleted((v) => ({ ...v, [String(p[0]?.group_id)]: true })),
  });

  return (
    <Container {...p} title='Groups'>
      <Controls>
        <Button forwardedAs={NavLink} to={groupId ? '../groups/create' : 'create'}>
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
        renderItem={(group: Group) =>
          !optimisticDeleted[String(group.id[0])] && (
            <GroupItem group={group} opened={groupId == String(group.id[0])}>
              <Controls>
                {!DEFAULT_GROUP_IDS.includes(group.id[0]!) && (
                  <UnionTooltipButtonComponent
                    {...deleteUnionButtonProps}
                    buttonContent={<DeleteText>Delete</DeleteText>}
                    submitVotingVerbose={<DeleteText>Create voting</DeleteText>}
                    getPayload={() => [{ group_id: group.id[0] }]}
                  >
                    <DeleteText>Delete</DeleteText>
                  </UnionTooltipButtonComponent>
                )}
              </Controls>
            </GroupItem>
          )
        }
      />
    </Container>
  );
})``;
