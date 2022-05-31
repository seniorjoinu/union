import React, { useState } from 'react';
import styled from 'styled-components';
import { PageWrapper, Pager, Button as B, Row as R } from '@union/components';
import { useUnion } from 'services';
import { VotingConfig } from 'union-ts';
import { NavLink, useParams } from 'react-router-dom';
import { DEFAULT_VOTING_CONFIG_IDS } from 'envs';
import { useRender } from '../../IDLRenderer';
import { UnionTooltipButton } from '../../../components/UnionSubmit';
import { useCurrentUnion } from '../context';
import { VotingConfigItem } from './VotingConfigItem';

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

export interface VotingConfigsProps {
  className?: string;
  style?: React.CSSProperties;
}

export const VotingConfigs = styled(({ ...p }: VotingConfigsProps) => {
  const { votingConfigId } = useParams();
  const { principal } = useCurrentUnion();
  const { canister } = useUnion(principal);
  const [optimisticDeleted, setOptimisticDeleted] = useState<Record<string, true>>({});
  const { View } = useRender<VotingConfig>({
    canisterId: principal,
    type: 'VotingConfig',
  });

  return (
    <Container {...p} title='Voting configs'>
      <Controls>
        <Button forwardedAs={NavLink} to={votingConfigId ? '../voting-configs/create' : 'create'}>
          +
        </Button>
      </Controls>
      <Pager
        size={5}
        fetch={({ index, size }) =>
          canister.list_voting_configs({
            page_req: {
              page_index: index,
              page_size: size,
              filter: { permission: [], group: [] },
              sort: null,
            },
            query_delegation_proof_opt: [],
          })
        }
        renderItem={(item: VotingConfig) => {
          const id = String(item.id[0]);

          return (
            !optimisticDeleted[id] && (
              <VotingConfigItem votingConfig={item} opened={votingConfigId == id} View={View}>
                <ItemControls>
                  <Button
                    forwardedAs={NavLink}
                    to={
                      votingConfigId
                        ? `../voting-configs/create-nested/${id}`
                        : `create-nested/${id}`
                    }
                    variant='caption'
                  >
                    Create nested
                  </Button>
                  {!DEFAULT_VOTING_CONFIG_IDS.includes(item.id[0]!) && (
                    <>
                      <Button
                        forwardedAs={NavLink}
                        to={votingConfigId ? `../voting-configs/edit/${id}` : `edit/${id}`}
                        variant='caption'
                      >
                        Edit
                      </Button>
                      <UnionTooltipButton
                        variant='caption'
                        color='red'
                        buttonContent='Delete'
                        submitVotingVerbose='Create voting'
                        getPayload={() => [{ id: item.id[0]! }]}
                        unionId={principal}
                        canisterId={principal}
                        methodName='delete_voting_config'
                        onExecuted={(p) =>
                          setOptimisticDeleted((v) => ({ ...v, [String(p[0]?.id)]: true }))
                        }
                      >
                        Delete
                      </UnionTooltipButton>
                    </>
                  )}
                </ItemControls>
              </VotingConfigItem>
            )
          );
        }}
      />
    </Container>
  );
})``;
