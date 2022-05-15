import { Accordeon, Field, Pager } from '@union/components';
import React, { useCallback } from 'react';
import { useUnion } from 'services';
import styled from 'styled-components';
import { AccessConfig } from 'union-ts';
import { GroupInfo } from '../Groups';
import { useCurrentUnion } from '../context';

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
}

export const AccessConfigItem = styled(({ accessConfig, ...p }: AccessConfigItemProps) => {
  const { principal } = useCurrentUnion();
  const { canister } = useUnion(principal);

  const handleToggle = useCallback(() => {
    // canister.list_groups({page_req: 100, })
  }, [canister]);

  return (
    <Accordeon title={accessConfig.name} border='no-border' onToggle={handleToggle} {...p}>
      <Container>
        <Field>{accessConfig.description}</Field>
        <Field title='Allowees' weight={{ title: 'medium' }}>
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
      </Container>
    </Accordeon>
  );
})``;
