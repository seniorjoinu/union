import { Accordeon, Column as C, Field, Text } from '@union/components';
import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { VotingConfig } from 'union-ts';
import { TProg } from '@union/candid-parser';
import { PermissionInfo } from '../Permissions';

const Column = styled(C)`
  border-left: 1px solid ${({ theme }) => theme.colors.grey};
  margin-left: 8px;
`;

const Zeroscreen = styled(Text)`
  color: ${({ theme }) => theme.colors.grey};
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px 0;

  & > *:not(:last-child) {
    margin-bottom: 8px;
  }

  & > ${Field} {
    ${Field}, ${Column} {
      padding-left: 8px;
    }
  }
`;

export interface VotingConfigItemProps {
  className?: string;
  style?: React.CSSProperties;
  votingConfig: VotingConfig;
  opened?: boolean;
  children?: React.ReactNode;
}

export const VotingConfigItem = styled(
  ({ votingConfig, opened, children, ...p }: VotingConfigItemProps) => {
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
      if (!opened || !ref.current) {
        return;
      }
      ref.current.scrollIntoView({ behavior: 'smooth' }); // FIXME shift with header height
    }, []);

    // TODO
    // export type ThresholdValue = { 'FractionOf' : FractionOf } |
    // { 'QuantityOf' : QuantityOf };
    //   export type Target = { 'Group' : GroupId } |
    // { 'Thresholds' : Array<ThresholdValue> };

    return (
      <Accordeon title={votingConfig.name} ref={ref} isDefaultOpened={opened} {...p}>
        <Container>
          {children}
          <Field variant={{ value: 'p3' }}>{votingConfig.description}</Field>
          {/* <Field title='Allowees' weight={{ title: 'medium' }}>
          </Field> */}
          <Field title='Permissions' weight={{ title: 'medium' }}>
            {!votingConfig.permissions.length && (
              <Zeroscreen variant='p3'>Permissions are not attached</Zeroscreen>
            )}
            {votingConfig.permissions.map((permissinId, i) => (
              <PermissionInfo
                key={String(i)}
                permissionId={permissinId}
                to={`../permissions/${String(permissinId)}`}
              />
            ))}
          </Field>
        </Container>
      </Accordeon>
    );
  },
)``;
