import React from 'react';
import styled from 'styled-components';
import { Text, Chips } from 'components';
import { NavLink } from 'react-router-dom';
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
`;

export interface InfoProps extends IClassName {
  title: string;
  items: { id: string | number; children: React.ReactNode }[];
  editLink?: string;
  href: string;
  fetching?: boolean;
}

export const Info = ({ items, fetching, title, editLink, href, ...p }: InfoProps) => (
  <Container {...p}>
    <Header>
      <Title variant='p1' as={NavLink} to={href}>
        {title}
      </Title>
      {editLink
        && false && ( // TODO временно отключено
          <NavLink to={editLink}>
            <img src={pencil} alt='pencil' />
          </NavLink>
        )}
    </Header>
    {fetching && <span>fetching</span>}
    <Items>
      {items.map(({ id, children }) => (
        <Chips key={id}>{children}</Chips>
      ))}
    </Items>
  </Container>
);
