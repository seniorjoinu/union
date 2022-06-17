import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { PageWrapper, Pager, Row as R, Button as B } from '@union/components';
import { Group, GroupExt } from 'union-ts';
import { useUnion } from 'services';
import { NavLink, useParams } from 'react-router-dom';
import { DEFAULT_GROUP_IDS } from 'envs';
import { UnionTooltipButton } from '../../../components/UnionSubmit';
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
    margin-bottom: 0;
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
  // const deleteUnionButtonProps = useUnionSubmit({
  //   unionId: principal,
  //   canisterId: principal,
  //   methodName: 'delete_group',
  //   onExecuted: (p) => setOptimisticDeleted((v) => ({ ...v, [String(p[0]?.group_id)]: true })),
  // });

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
        renderItem={({ it: group, transferable }: GroupExt) => {
          const id = String(group.id[0]);

          return (
            !optimisticDeleted[id] && (
              <GroupItem
                group={group}
                opened={groupId == id}
                acceptedAdornment={
                  <ItemControls>
                    {!DEFAULT_GROUP_IDS.includes(group.id[0]!) && transferable && (
                      <>
                        <Button
                          forwardedAs={NavLink}
                          to={groupId ? `../groups/burn/${id}` : `burn/${id}`}
                          variant='caption'
                          color='red'
                        >
                          Burn shares
                        </Button>
                      </>
                    )}
                  </ItemControls>
                }
                unacceptedAdornment={
                  <ItemControls>
                    {!DEFAULT_GROUP_IDS.includes(group.id[0]!) && transferable && (
                      <>
                        <Button
                          forwardedAs={NavLink}
                          to={groupId ? `../groups/burn-unaccepted/${id}` : `burn-unaccepted/${id}`}
                          variant='caption'
                          color='red'
                        >
                          Burn unaccepted shares
                        </Button>
                      </>
                    )}
                  </ItemControls>
                }
              >
                <ItemControls>
                  {!DEFAULT_GROUP_IDS.includes(group.id[0]!) && (
                    <>
                      <Button
                        forwardedAs={NavLink}
                        to={groupId ? `../groups/mint/${id}` : `mint/${id}`}
                        variant='caption'
                      >
                        Mint shares
                      </Button>
                      {transferable && (
                        <Button
                          forwardedAs={NavLink}
                          to={groupId ? `../groups/transfer/${id}` : `transfer/${id}`}
                          variant='caption'
                        >
                          Transfer shares
                        </Button>
                      )}
                      <Button
                        forwardedAs={NavLink}
                        to={groupId ? `../groups/edit/${id}` : `edit/${id}`}
                        variant='caption'
                      >
                        Edit
                      </Button>
                      <UnionTooltipButton
                        variant='caption'
                        color='red'
                        buttonContent='Delete'
                        submitVotingVerbose='Start voting'
                        getPayload={() => [{ group_id: group.id[0]! }]}
                        methodName='delete_group'
                        unionId={principal}
                        canisterId={principal}
                        onExecuted={(p) =>
                          setOptimisticDeleted((v) => ({ ...v, [String(p[0]?.group_id)]: true }))
                        }
                      >
                        Delete
                      </UnionTooltipButton>
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
