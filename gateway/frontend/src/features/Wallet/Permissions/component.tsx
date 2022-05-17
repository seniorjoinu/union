import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { PageWrapper, Pager, getFontStyles, Button as B, Row as R, Text } from '@union/components';
import { useUnion } from 'services';
import { Permission } from 'union-ts';
import { NavLink, useParams } from 'react-router-dom';
import { DEFAULT_PERMISSION_IDS } from 'envs';
import { UnionTooltipButtonComponent, useUnionSubmit } from '../../../components/UnionSubmit';
import { useCurrentUnion } from '../context';
import { PermissionItem } from './PermissionItem';

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

export interface PermissionsProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Permissions = styled(({ ...p }: PermissionsProps) => {
  const { permissionId } = useParams();
  const { principal } = useCurrentUnion();
  const { canister } = useUnion(principal);
  const [optimisticDeleted, setOptimisticDeleted] = useState<Record<string, true>>({});
  const deleteUnionButtonProps = useUnionSubmit({
    canisterId: principal,
    methodName: 'delete_permission',
    onExecuted: (p) => setOptimisticDeleted((v) => ({ ...v, [String(p[0]?.id)]: true })),
  });

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
          })
        }
        renderItem={(item: Permission) => {
          const id = String(item.id[0]!);

          return (
            !optimisticDeleted[id] && (
              <PermissionItem permission={item} opened={permissionId == id}>
                <Controls>
                  {!DEFAULT_PERMISSION_IDS.includes(item.id[0]!) && (
                    <>
                      <Button
                        forwardedAs={NavLink}
                        to={permissionId ? `../permissions/edit/${id}` : `edit/${id}`}
                      >
                        Edit
                      </Button>
                      <UnionTooltipButtonComponent
                        {...deleteUnionButtonProps}
                        buttonContent={<DeleteText>Delete</DeleteText>}
                        submitVotingVerbose={<DeleteText>Create voting</DeleteText>}
                        getPayload={() => [{ id: item.id[0] }]}
                      >
                        <DeleteText>Delete</DeleteText>
                      </UnionTooltipButtonComponent>
                    </>
                  )}
                </Controls>
              </PermissionItem>
            )
          );
        }}
      />
    </Container>
  );
})``;
