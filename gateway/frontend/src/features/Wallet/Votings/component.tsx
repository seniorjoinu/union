import React, { useState } from 'react';
import styled from 'styled-components';
import { PageWrapper, Pager, Button as B, Row as R } from '@union/components';
import { useUnion } from 'services';
import { Voting } from 'union-ts';
import { NavLink, useParams } from 'react-router-dom';
import { useRender } from '../../IDLRenderer';
import { useUnionSubmit } from '../../../components/UnionSubmit';
import { useCurrentUnion } from '../context';
import { VotingControls } from './VotingControls';
import { VotingItem } from './VotingItem';

const Button = styled(B)``;
const StartItemControls = styled(R)`
  justify-content: flex-start;
`;
const Controls = styled(R)`
  justify-content: flex-end;

  &:empty {
    display: none;
  }

  ${StartItemControls} {
    flex-grow: 1;
  }
`;
const ItemControls = styled(Controls)`
  justify-content: space-between;
`;

const Container = styled(PageWrapper)`
  ${Controls} {
    margin-bottom: 16px;
  }
  ${ItemControls} {
    margin-bottom: 4px;
  }
`;

export interface VotingsProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Votings = styled(({ ...p }: VotingsProps) => {
  const { votingId } = useParams();
  const { principal } = useCurrentUnion();
  const { canister } = useUnion(principal);
  const [optimisticDeleted, setOptimisticDeleted] = useState<Record<string, true>>({});
  const deleteUnionButtonProps = useUnionSubmit({
    unionId: principal,
    canisterId: principal,
    methodName: 'delete_voting',
    onExecuted: (p) => setOptimisticDeleted((v) => ({ ...v, [String(p[0]?.id)]: true })),
  });
  const { View } = useRender<Voting>({
    canisterId: principal,
    type: 'Voting',
  });

  return (
    <Container {...p} title='Votings'>
      <Controls>
        <Button forwardedAs={NavLink} to={votingId ? '../votings/crud/create' : 'crud/create'}>
          +
        </Button>
      </Controls>
      <Pager
        size={5}
        fetch={({ index, size }) =>
          canister.list_votings({
            page_req: {
              page_index: index,
              page_size: size,
              filter: null,
              sort: null,
            },
            query_delegation_proof_opt: [],
          })
        }
        renderItem={(item: Voting) => {
          const id = String(item.id[0]);

          return (
            !optimisticDeleted[id] && (
              <VotingItem voting={item} opened={votingId == id} View={View} unionId={principal}>
                <ItemControls>
                  <StartItemControls>
                    <Button
                      forwardedAs={NavLink}
                      to={votingId ? `../votings/voting/${id}` : `voting/${id}`}
                      variant='caption'
                    >
                      More info
                    </Button>
                  </StartItemControls>
                  <VotingControls
                    voting={item}
                    navPrefix={votingId ? '../votings/' : ''}
                    deleteUnionButtonProps={deleteUnionButtonProps}
                  />
                </ItemControls>
              </VotingItem>
            )
          );
        }}
      />
    </Container>
  );
})``;
