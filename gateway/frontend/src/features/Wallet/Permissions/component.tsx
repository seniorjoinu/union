import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { PageWrapper, Pager, Button as B, Row as R } from '@union/components';
import { useUnion } from 'services';
import { Permission } from 'union-ts';
import { NavLink, useParams } from 'react-router-dom';
import { DEFAULT_PERMISSION_IDS } from 'envs';
import { UnionTooltipButton } from '../../../components/UnionSubmit';
import { useCurrentUnion } from '../context';
import { PermissionItem } from './PermissionItem';

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

export interface PermissionsProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Permissions = styled(({ ...p }: PermissionsProps) => {
  const { permissionId } = useParams();
  const { principal } = useCurrentUnion();
  const { canister } = useUnion(principal);
  const [optimisticDeleted, setOptimisticDeleted] = useState<Record<string, true>>({});

  return (
    <Container {...p} title='Permissions'>
      <Controls>
        <Button forwardedAs={NavLink} to={permissionId ? '../permissions/create' : 'create'}>
          +
        </Button>
      </Controls>
      <Pager
        size={5}
        fetch={({ index, size }) =>
          canister.list_permissions({
            page_req: {
              page_index: index,
              page_size: size,
              sort: null,
              filter: { target: [] },
            },
            query_delegation_proof_opt: [],
          })
        }
        renderItem={(item: Permission) => {
          const id = String(item.id[0]!);

          return (
            !optimisticDeleted[id] && (
              <PermissionItem permission={item} opened={permissionId == id}>
                <ItemControls>
                  {!DEFAULT_PERMISSION_IDS.includes(item.id[0]!) && (
                    <>
                      <Button
                        forwardedAs={NavLink}
                        to={permissionId ? `../permissions/edit/${id}` : `edit/${id}`}
                        variant='caption'
                      >
                        Edit
                      </Button>
                      <UnionTooltipButton
                        buttonContent='Delete'
                        variant='caption'
                        color='red'
                        submitVotingVerbose='Create voting'
                        getPayload={() => [{ id: item.id[0]! }]}
                        unionId={principal}
                        canisterId={principal}
                        methodName='delete_permission'
                        onExecuted={(p) =>
                          setOptimisticDeleted((v) => ({ ...v, [String(p[0]?.id)]: true }))
                        }
                      >
                        Delete
                      </UnionTooltipButton>
                    </>
                  )}
                </ItemControls>
              </PermissionItem>
            )
          );
        }}
      />
    </Container>
  );
})``;
