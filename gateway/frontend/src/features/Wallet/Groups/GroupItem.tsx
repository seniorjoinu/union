import { Text, Accordeon, Field, Chips, Row } from '@union/components';
import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Group } from 'union-ts';

const Head = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px 0;

  & > *:not(:last-child) {
    margin-bottom: 8px;
  }
`;

export interface GroupItemProps {
  className?: string;
  style?: React.CSSProperties;
  group: Group;
  opened?: boolean;
  children?: React.ReactNode;
}

export const GroupItem = styled(({ group, opened, children, ...p }: GroupItemProps) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!opened || !ref.current) {
      return;
    }
    ref.current.scrollIntoView({ behavior: 'smooth' }); // FIXME shift with header height
  }, []);

  return (
    <Accordeon
      ref={ref}
      title={
        <Head>
          <Text variant='h5'>{group.name}</Text>
        </Head>
      }
      isDefaultOpened={opened}
      {...p}
    >
      <Container>
        {children}
        <Row>
          {group.private && <Chips variant='p3'>private</Chips>}
          <Chips variant='p3'>share id {String(group.token)}</Chips>
        </Row>
        <Field variant={{ value: 'p3' }}>{group.description}</Field>
      </Container>
    </Accordeon>
  );
})``;
