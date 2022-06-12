import { Accordeon, Column as C, Field, Text } from '@union/components';
import React, { useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';
import { AccessConfig, GroupCondition, ProfileId } from 'union-ts';
import { defaultFieldProps } from '../../IDLRenderer';
import { GroupInfo } from '../Groups';
import { ProfileInfo } from '../Profile';
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

    const { groups, profiles, everyones } = useMemo(() => {
      const groups: GroupCondition[] = [];
      const profiles: ProfileId[] = [];
      const everyones: boolean[] = [];

      accessConfig.allowees.forEach((a) => {
        if ('Group' in a) {
          groups.push(a.Group);
        } else if ('Profile' in a) {
          profiles.push(a.Profile);
        } else {
          everyones.push(true);
        }
      });

      return { groups, profiles, everyones };
    }, [accessConfig.allowees]);

    return (
      <Accordeon title={accessConfig.name} ref={ref} isDefaultOpened={opened} {...p}>
        <Container>
          {children}
          <Field {...defaultFieldProps}>{accessConfig.description}</Field>
          <Field title='Allowees' {...defaultFieldProps} weight={{ title: 'medium' }}>
            {!accessConfig.allowees.length && (
              <Zeroscreen variant='p3'>Allowees are not attached</Zeroscreen>
            )}
            {!!everyones.length && (
              <Field
                title='Everyone'
                variant={{ title: 'p3', value: 'p3' }}
                weight={{ title: 'medium' }}
              />
            )}
            {/* {!!everyones.length && <Field title='Everyone' variant={{ value: 'p3' }} />} */}
            {!!groups.length && (
              <Field
                title='Groups'
                variant={{ title: 'p3', value: 'p3' }}
                weight={{ title: 'medium' }}
              >
                <Column>
                  {groups.map((g) => (
                    <GroupInfo
                      key={String(g.id)}
                      groupId={g.id}
                      shares={g.min_shares}
                      verbose={{ shares: 'min' }}
                      to={`../groups/${String(g.id)}`}
                    />
                  ))}
                </Column>
              </Field>
            )}
            {!!profiles.length && (
              <Field
                title='Profiles'
                variant={{ title: 'p3', value: 'p3' }}
                weight={{ title: 'medium' }}
              >
                <Column>
                  {profiles.map((p, i) => (
                    <ProfileInfo key={`${p.toString()}${i}`} profileId={p} />
                  ))}
                </Column>
              </Field>
            )}
          </Field>
          <Field title='Permissions' {...defaultFieldProps} weight={{ title: 'medium' }}>
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
