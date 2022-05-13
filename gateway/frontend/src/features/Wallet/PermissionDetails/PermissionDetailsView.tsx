import React from 'react';
import styled from 'styled-components';
import { Text, TextProps, Button as B } from '@union/components';
import { Permission } from 'union-ts';
import { parsePermission } from '../utils';

const DetachButton = styled(B)``;
const RemoveButton = styled(B)`
  color: red;
`;
const Title = styled(Text)``;
const Description = styled(Text)``;
const Item = styled.div`
  display: flex;
  flex-direction: column;

  & > *:not(:last-child) {
    margin-bottom: 8px;
  }
`;
const Controls = styled.div`
  display: flex;
  flex-direction: row;

  & > * {
    margin-right: 8px;
  }
`;
const Items = styled.div`
  display: flex;
  flex-direction: column;

  & > * {
    padding: 8px;
    border: 1px solid grey;
    border-radius: 4px;
  }

  & > *:not(:last-child) {
    margin-bottom: 16px;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;

  ${Title}, ${Items} {
    margin-bottom: 24px;
  }
  & > ${Description} {
    margin-bottom: 16px;
  }
  ${Controls} {
    margin-bottom: 16px;
  }
`;

export interface PermissionDetailsViewProps extends IClassName {
  permission: Permission;
  variant?: TextProps['variant'];
  detach?(): void;
  remove?(): void;
  edit?(): void;
}

export const PermissionDetailsView = ({
  variant = 'p1',
  permission,
  detach,
  remove,
  edit,
  ...p
}: PermissionDetailsViewProps) => {
  const parsedPermission = parsePermission(permission);

  return (
    <Container {...p}>
      <Controls>
        {detach && (
          <DetachButton size='S' onClick={detach}>
            Detach
          </DetachButton>
        )}
        {edit && (
          <DetachButton size='S' onClick={edit}>
            Edit
          </DetachButton>
        )}
        {remove && (
          <RemoveButton size='S' onClick={remove}>
            Remove
          </RemoveButton>
        )}
      </Controls>
      <Title variant={variant}>Name: {parsedPermission.name}</Title>
      {!!parsedPermission.targets.length && (
        <>
          <Title variant='h4'>Targets</Title>
          <Items>
            {parsedPermission.targets.map((target, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <Item key={String(i)}>
                <Text variant='p3'>Type: {target.type}</Text>
                {!!target.canisterId && (
                  <Description variant='p3'>
                    {target.canisterId}:{target.method || '*'}
                    {target.method ? '()' : ''}
                  </Description>
                )}
              </Item>
            ))}
          </Items>
        </>
      )}
    </Container>
  );
};
