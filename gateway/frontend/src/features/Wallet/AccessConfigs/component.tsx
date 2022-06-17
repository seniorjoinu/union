import React, { useState } from 'react';
import styled from 'styled-components';
import { PageWrapper, Pager, Button as B, Row as R } from '@union/components';
import { useUnion } from 'services';
import { AccessConfig } from 'union-ts';
import { NavLink, useParams } from 'react-router-dom';
import { DEFAULT_ACCESS_CONFIG_IDS } from 'envs';
import { UnionTooltipButton } from '../../../components/UnionSubmit';
import { useCurrentUnion } from '../context';
import { AccessConfigItem } from './AccessConfigItem';

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

export interface AccessConfigsProps {
  className?: string;
  style?: React.CSSProperties;
}

export const AccessConfigs = styled(({ ...p }: AccessConfigsProps) => {
  const { accessConfigId } = useParams();
  const { principal } = useCurrentUnion();
  const { canister } = useUnion(principal);
  const [optimisticDeleted, setOptimisticDeleted] = useState<Record<string, true>>({});

  return (
    <Container {...p} title='Access configs'>
      <Controls>
        <Button forwardedAs={NavLink} to={accessConfigId ? '../access-configs/create' : 'create'}>
          +
        </Button>
      </Controls>
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
            query_delegation_proof_opt: [],
          })
        }
        renderItem={(item: AccessConfig) => {
          const id = String(item.id[0]);

          return (
            !optimisticDeleted[id] && (
              <AccessConfigItem accessConfig={item} opened={accessConfigId == id}>
                <ItemControls>
                  <Button
                    forwardedAs={NavLink}
                    to={accessConfigId ? `../access-configs/edit/${id}` : `edit/${id}`}
                    variant='caption'
                  >
                    Edit
                  </Button>
                  {!DEFAULT_ACCESS_CONFIG_IDS.includes(item.id[0]!) && (
                    <>
                      <UnionTooltipButton
                        variant='caption'
                        color='red'
                        buttonContent='Delete'
                        submitVotingVerbose='Start voting'
                        getPayload={() => [{ id: item.id[0]! }]}
                        unionId={principal}
                        canisterId={principal}
                        methodName='delete_access_config'
                        onExecuted={(p) =>
                          setOptimisticDeleted((v) => ({ ...v, [String(p[0]?.id)]: true }))
                        }
                      >
                        Delete
                      </UnionTooltipButton>
                    </>
                  )}
                </ItemControls>
              </AccessConfigItem>
            )
          );
        }}
      />
    </Container>
  );
})``;
