import React, { useState } from 'react';
import styled from 'styled-components';
import { PageWrapper, Pager, Button as B, Row as R, Text, getFontStyles } from '@union/components';
import { useUnion } from 'services';
import { AccessConfig } from 'union-ts';
import { NavLink, useParams } from 'react-router-dom';
import { DEFAULT_ACCESS_CONFIG_IDS } from 'envs';
import { UnionTooltipButtonComponent, useUnionSubmit } from '../../../components/UnionSubmit';
import { useCurrentUnion } from '../context';
import { AccessConfigItem } from './AccessConfigItem';

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

export interface AccessConfigsProps {
  className?: string;
  style?: React.CSSProperties;
}

export const AccessConfigs = styled(({ ...p }: AccessConfigsProps) => {
  const { accessConfigId } = useParams();
  const { principal } = useCurrentUnion();
  const { canister } = useUnion(principal);
  const [optimisticDeleted, setOptimisticDeleted] = useState<Record<string, true>>({});
  const deleteUnionButtonProps = useUnionSubmit({
    canisterId: principal,
    methodName: 'delete_access_config',
    onExecuted: (p) => setOptimisticDeleted((v) => ({ ...v, [String(p[0]?.id)]: true })),
  });

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
          })
        }
        renderItem={(item: AccessConfig) =>
          !optimisticDeleted[String(item.id[0])] && (
            <AccessConfigItem accessConfig={item} opened={accessConfigId == String(item.id[0])}>
              <Controls>
                {!DEFAULT_ACCESS_CONFIG_IDS.includes(item.id[0]!) && (
                  <UnionTooltipButtonComponent
                    {...deleteUnionButtonProps}
                    buttonContent={<DeleteText>Delete</DeleteText>}
                    submitVotingVerbose={<DeleteText>Create voting</DeleteText>}
                    getPayload={() => [{ id: item.id[0] }]}
                  >
                    <DeleteText>Delete</DeleteText>
                  </UnionTooltipButtonComponent>
                )}
              </Controls>
            </AccessConfigItem>
          )
        }
      />
    </Container>
  );
})``;
