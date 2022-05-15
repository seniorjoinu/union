import { Text, Accordeon, theme, Field } from '@union/components';
import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Group } from 'union-ts';

const Head = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px;

  & > *:not(:last-child) {
    margin-bottom: 8px;
  }
`;

export interface GroupItemProps {
  className?: string;
  style?: React.CSSProperties;
  group: Group;
  opened?: boolean;
}

export const GroupItem = styled(({ group, opened, ...p }: GroupItemProps) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!opened || !ref.current) {
      return;
    }
    ref.current.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <Accordeon
      ref={ref}
      title={
        <Head>
          <Text variant='h5'>{group.name}</Text>
          <Text variant='p1' color={theme.colors.grey}>
            {group.private ? 'Private' : ''}
          </Text>
        </Head>
      }
      isDefaultOpened={opened}
      border='no-border'
      {...p}
    >
      <Container>
        <Field title='Share id' align='row'>
          {String(group.token)}
        </Field>
        <Field>{group.description}</Field>
      </Container>
    </Accordeon>
  );
})``;
