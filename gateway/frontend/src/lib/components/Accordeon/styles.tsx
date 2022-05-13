import styled from 'styled-components';
import { Text } from '../Text';
import * as A from './arrow-bracket';

export type Borders = 'border' | 'no-border';

export const Title = styled(Text)`
  display: flex;
  flex-grow: 1;
  flex-shrink: 1;
  padding-right: 32px;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: black;
`;

export const HeaderHandler = styled.header<{ isStatic: boolean; border: Borders }>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  position: relative;
  cursor: ${({ isStatic }) => (isStatic ? 'default' : 'pointer')};

  & > * {
    z-index: 2;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    border-bottom: ${({ border }) => (border == 'border' ? '1px solid grey' : 'none')};
    z-index: 1;
  }
`;

export const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-shrink: 1;
  min-width: 0;

  & > * {
    z-index: 2;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1;
  }
`;

export const Children = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Arrow = styled(A.ArrowBracket)<{ $isOpened: boolean }>`
  flex-shrink: 0;
  flex-grow: 0;
  transition: transform 200ms ease;
  fill: darkgrey;
  transform: scaleY(${({ $isOpened }) => ($isOpened ? -1 : 1)});
`;

export const Container = styled.section<{ border: Borders }>`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 4px;
  border: ${({ border }) => (border == 'border' ? '1px solid grey' : 'none')};
  transition: border-color 200ms ease;

  & & {
    border-radius: 0;
    border-left-width: 0;
    border-right-width: 0;

    ${Title} {
      color: black;
    }

    ${Header}::after {
      background-color: lightgrey;
    }
  }
  & & + & {
    border-top-width: 0;

    &:last-of-type {
      border-bottom-width: 0;
    }
  }
`;
