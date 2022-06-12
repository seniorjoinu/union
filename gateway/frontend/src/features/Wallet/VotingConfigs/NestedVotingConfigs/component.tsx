import React, { useState } from 'react';
import styled from 'styled-components';
import { Pager, Button as B, Row as R, Column } from '@union/components';
import { useUnion } from 'services';
import { NestedVotingConfig } from 'union-ts';
import { NavLink, useParams } from 'react-router-dom';
import { useRender } from '../../../IDLRenderer';
import { UnionTooltipButtonComponent, useUnionSubmit } from '../../../../components/UnionSubmit';
import { useCurrentUnion } from '../../context';
import { NestedVotingConfigItem } from './NestedVotingConfigItem';

const Button = styled(B)``;
const Controls = styled(R)`
  justify-content: flex-end;

  &:empty {
    display: none;
  }
`;
const ItemControls = styled(Controls)``;

const Container = styled(Column)`
  ${Controls} {
    margin-bottom: 16px;
  }
  ${ItemControls} {
    margin-bottom: 4px;
  }
`;

export interface NestedVotingConfigsProps {
  className?: string;
  style?: React.CSSProperties;
  parentVotingConfig?: bigint;
  parentNestedVotingConfig?: bigint;
}

export const NestedVotingConfigs = styled(
  ({ parentVotingConfig, parentNestedVotingConfig, ...p }: NestedVotingConfigsProps) => {
    const { votingConfigId } = useParams();
    const { principal } = useCurrentUnion();
    const { canister } = useUnion(principal);
    const [optimisticDeleted, setOptimisticDeleted] = useState<Record<string, true>>({});
    const deleteUnionButtonProps = useUnionSubmit({
      unionId: principal,
      canisterId: principal,
      methodName: 'delete_nested_voting_config',
      onExecuted: (p) => setOptimisticDeleted((v) => ({ ...v, [String(p[0]?.id)]: true })),
    });
    const { View } = useRender<NestedVotingConfig>({
      canisterId: principal,
      type: 'NestedVotingConfig',
    });

    return (
      <Container {...p} title='Nested voting configs'>
        <Pager
          size={5}
          fetch={({ index, size }) =>
            canister.list_nested_voting_configs({
              page_req: {
                page_index: index,
                page_size: size,
                filter: {
                  remote_voting_config: parentVotingConfig ? [[principal, parentVotingConfig]] : [],
                  remote_nested_voting_config: parentNestedVotingConfig
                    ? [[principal, parentNestedVotingConfig]]
                    : [],
                },
                sort: null,
              },
              query_delegation_proof_opt: [],
            })
          }
          verbose={{ zeroscreen: 'Nested voting configs do not exist' }}
          renderItem={(item: NestedVotingConfig) => {
            const id = String(item.id[0]);

            return (
              !optimisticDeleted[id] && (
                <NestedVotingConfigItem
                  votingConfig={item}
                  opened={votingConfigId == id}
                  View={View}
                  // endAdornment={
                  //   <Field
                  //     title='Nested voting configs'
                  //     {...defaultFieldProps}
                  //   >
                  //     <NestedVotingConfigs parentNestedVotingConfig={item.id[0]} />
                  //   </Field>
                  // }
                >
                  <ItemControls>
                    <Button
                      forwardedAs={NavLink}
                      to={
                        votingConfigId
                          ? `../voting-configs/create-nested-nested/${id}`
                          : `create-nested-nested/${id}`
                      }
                      variant='caption'
                    >
                      Create nested
                    </Button>
                    <Button
                      forwardedAs={NavLink}
                      to={
                        votingConfigId ? `../voting-configs/edit-nested/${id}` : `edit-nested/${id}`
                      }
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
                      getPayload={() => [{ id: item.id[0] }]}
                    >
                      Delete
                    </UnionTooltipButtonComponent>
                  </ItemControls>
                </NestedVotingConfigItem>
              )
            );
          }}
        />
      </Container>
    );
  },
)``;
