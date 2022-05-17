import { Accordeon, Field, Text, Column } from '@union/components';
import React, { useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';
import { Permission } from 'union-ts';

const Zeroscreen = styled(Text)`
  color: ${({ theme }) => theme.colors.grey};
`;

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
  opened?: boolean;
  children?: React.ReactNode;
}

export const PermissionItem = styled(
  ({ permission, opened, children, ...p }: PermissionItemProps) => {
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
      if (!opened || !ref.current) {
        return;
      }
      ref.current.scrollIntoView({ behavior: 'smooth' }); // FIXME shift with header height
    }, []);

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
      <Accordeon title={permission.name} ref={ref} isDefaultOpened={opened} {...p}>
        <Container>
          {children}
          <Field>{permission.description}</Field>
          <Field title='Targets' weight={{ title: 'medium' }}>
            {!Object.keys(targets).length && (
              <Zeroscreen variant='p3'>Targets are not attached</Zeroscreen>
            )}
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
  },
)``;
