import { Accordeon, Field, Text, Row as R, Chips } from '@union/components';
import React, { useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';
import { Permission } from 'union-ts';
import { defaultFieldProps } from '../../IDLRenderer';

const Zeroscreen = styled(Text)`
  color: ${({ theme }) => theme.colors.grey};
`;

const TitleChips = styled(Chips)`
  padding: 2px 8px;
  border-color: ${({ theme }) => theme.colors.dark};
`;

const Row = styled(R)`
  flex-wrap: wrap;
  & > * {
    margin-bottom: 4px;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px 0;

  & > *:not(:last-child) {
    margin-bottom: 8px;
  }

  ${Field} ${Field}, ${Zeroscreen} {
    padding-left: 8px;
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
          <Field {...defaultFieldProps} weight={{ title: 'medium' }}>
            {permission.description}
          </Field>
          <Field title='Targets' {...defaultFieldProps} weight={{ title: 'medium' }}>
            {!Object.keys(targets).length && (
              <Zeroscreen variant='p3'>Targets are not attached</Zeroscreen>
            )}
            {Object.keys(targets).map((canisterId) =>
              (canisterId ? (
                <Field
                  key={canisterId}
                  title={
                    <TitleChips variant='p3' color='dark' important>
                      {canisterId}
                    </TitleChips>
                  }
                >
                  <Row>
                    {targets[canisterId].map((method) => (
                      <Chips key={method} variant='p3'>
                        {method}
                      </Chips>
                    ))}
                  </Row>
                </Field>
              ) : (
                <Field
                  key='empty'
                  title={
                    <TitleChips variant='p3' color='dark' important>
                      Empty program
                    </TitleChips>
                  }
                />
              )),
            )}
          </Field>
        </Container>
      </Accordeon>
    );
  },
)``;
