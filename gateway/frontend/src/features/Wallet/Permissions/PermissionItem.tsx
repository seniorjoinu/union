import { Accordeon, Field, Text, Column } from '@union/components';
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Permission } from 'union-ts';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px;

  & > *:not(:last-child) {
    margin-bottom: 8px;
  }

  & > ${Field} {
    ${Column}, & > * > ${Field} {
      padding-left: 8px;
    }
  }
`;

export interface PermissionItemProps {
  className?: string;
  style?: React.CSSProperties;
  permission: Permission;
}

export const PermissionItem = styled(({ permission, ...p }: PermissionItemProps) => {
  const targets: Record<string, string[]> = useMemo(
    () =>
      permission.targets.reduce((acc, target) => {
        if ('Endpoint' in target) {
          const key = target.Endpoint.canister_id.toString();
          const ex = acc[key] || [];

          return {
            ...acc,
            [key]: [...ex, target.Endpoint.method_name],
          };
        }
        return { ...acc, '': [] };
      }, {} as Record<string, string[]>),
    [permission.targets],
  );

  return (
    <Accordeon title={permission.name} border='no-border' {...p}>
      <Container>
        <Field>{permission.description}</Field>
        <Field title='Targets' weight={{ title: 'medium' }}>
          {Object.keys(targets).map((canisterId) =>
            (canisterId ? (
              <Field key={canisterId} title={canisterId}>
                <Column>
                  {targets[canisterId].map((method) => (
                    <Text key={method} variant='p3'>
                      {method}
                    </Text>
                  ))}
                </Column>
              </Field>
            ) : (
              <Field key='empty' title='Empty program' />
            )),
          )}
        </Field>
      </Container>
    </Accordeon>
  );
})``;
