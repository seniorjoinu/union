import { Accordeon, Field, Text } from '@union/components';
import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { AccessConfig } from 'union-ts';
import { GroupInfo } from '../Groups';
import { PermissionInfo } from '../Permissions';

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
    & > * > ${Field} {
      padding-left: 8px;
    }
  }
`;

export interface AccessConfigItemProps {
  className?: string;
  style?: React.CSSProperties;
  accessConfig: AccessConfig;
  opened?: boolean;
  children?: React.ReactNode;
}

export const AccessConfigItem = styled(
  ({ accessConfig, opened, children, ...p }: AccessConfigItemProps) => {
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
      if (!opened || !ref.current) {
        return;
      }
      ref.current.scrollIntoView({ behavior: 'smooth' }); // FIXME shift with header height
    }, []);

    return (
      <Accordeon title={accessConfig.name} ref={ref} isDefaultOpened={opened} {...p}>
        <Container>
          {children}
          <Field>{accessConfig.description}</Field>
          <Field title='Allowees' weight={{ title: 'medium' }}>
            {!accessConfig.allowees.length && (
              <Zeroscreen variant='p3'>Allowees are not attached</Zeroscreen>
            )}
            {accessConfig.allowees.map((allowee, i) =>
              ('Group' in allowee ? (
                <GroupInfo
                  key={String(i)}
                  groupId={allowee.Group.id}
                  to={`../groups/${String(allowee.Group.id)}`}
                />
              ) : 'Profile' in allowee ? (
                <Field key={String(i)} title='Profile' variant={{ value: 'p3' }}>
                  {allowee.Profile.toString()}
                </Field>
              ) : (
                <Field key={String(i)} title='Everyone' variant={{ value: 'p3' }}>
                  Everyone
                </Field>
              )),
            )}
          </Field>
          <Field title='Permissions' weight={{ title: 'medium' }}>
            {!accessConfig.permissions.length && (
              <Zeroscreen variant='p3'>Permissions are not attached</Zeroscreen>
            )}
            {accessConfig.permissions.map((permissinId, i) => (
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
