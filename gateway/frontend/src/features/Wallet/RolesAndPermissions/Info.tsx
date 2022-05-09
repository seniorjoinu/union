import React from 'react';
import styled from 'styled-components';
import { Text, Chips } from '@union/components';
import pencil from '../../../assets/pencil.svg';

const Title = styled(Text)`
  cursor: pointer;
  text-decoration: none;
  color: black;

  &:hover {
    color: darkgrey;
  }
`;

const Header = styled.div`
  display: flex;
  flex-direction: row;

  & > *:not(:last-child) {
    margin-right: 16px;
  }
`;

const Items = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;

  & > *:not(:last-child) {
    margin-right: 16px;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;

  ${Title} {
    margin-bottom: 8px;
  }

  img {
    cursor: pointer;
  }
`;

export interface InfoProps extends IClassName {
  title: string;
  items: { id: string | number; children: React.ReactNode }[];
  edit?(): void;
  open?(): void;
  fetching?: boolean;
}

export const Info = ({ items, fetching, title, edit, open, ...p }: InfoProps) => (
  <Container {...p}>
    <Header>
      <Title variant='p1' onClick={open}>
        {title}
      </Title>
      {edit && <img src={pencil} alt='pencil' onClick={edit} />}
    </Header>
    {fetching && <span>fetching</span>}
    <Items>
      {items.map(({ id, children }) => (
        <Chips key={id}>{children}</Chips>
      ))}
    </Items>
  </Container>
);
