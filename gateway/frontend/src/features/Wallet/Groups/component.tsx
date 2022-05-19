import React, { useState } from 'react';
import styled from 'styled-components';
import { PageWrapper, Pager, Row as R, Button as B } from '@union/components';
import { Group } from 'union-ts';
import { useUnion } from 'services';
import { NavLink, useParams } from 'react-router-dom';
import { DEFAULT_GROUP_IDS } from 'envs';
import { UnionTooltipButtonComponent, useUnionSubmit } from '../../../components/UnionSubmit';
import { useCurrentUnion } from '../context';
import { GroupItem } from './GroupItem';

const Button = styled(B)``;
const Controls = styled(R)`
  justify-content: flex-end;

  &:empty {
    display: none;
  }
`;
const ItemControls = styled(Controls)``;

const Container = styled(PageWrapper)`
  ${Controls} {
    margin-bottom: 16px;
  }
  ${ItemControls} {
    margin-bottom: 4px;
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
    unionId: principal,
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
            query_delegation_proof_opt: [],
          })
        }
        renderItem={(group: Group) => {
          const id = String(group.id[0]);

          return (
            !optimisticDeleted[id] && (
              <GroupItem group={group} opened={groupId == id}>
                <ItemControls>
                  {!DEFAULT_GROUP_IDS.includes(group.id[0]!) && (
                    <>
                      <Button
                        forwardedAs={NavLink}
                        to={groupId ? `../groups/edit/${id}` : `edit/${id}`}
                        variant='caption'
                      >
                        Edit
                      </Button>
                      <UnionTooltipButtonComponent
                        {...deleteUnionButtonProps}
                        variant='caption'
                        color='red'
                        buttonContent='Delete'
                        submitVotingVerbose='Create voting'
                        getPayload={() => [{ group_id: group.id[0] }]}
                      >
                        Delete
                      </UnionTooltipButtonComponent>
                    </>
                  )}
                </ItemControls>
              </GroupItem>
            )
          );
        }}
      />
    </Container>
  );
})``;
