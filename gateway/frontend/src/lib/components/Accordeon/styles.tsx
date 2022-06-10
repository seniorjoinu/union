import styled, { css } from 'styled-components';
import { getFontStyles, Text } from '../Text';
import { Mark as M } from '../Select/Mark';

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
  color: ${({ theme }) => theme.colors.dark};

  ${getFontStyles('h5', 'medium')}
`;

export const Mark = styled(M)<{ $isOpened: boolean }>`
  flex-shrink: 0;
  flex-grow: 0;
  height: 9px;
  width: 9px;
  transition: transform 0.2s, color 0.2s ease;
  color: ${({ theme }) => theme.colors.dark};
  transform: rotate(${({ $isOpened }) => ($isOpened ? '0deg' : '45deg')});
`;

export const HeaderHandler = styled.header<{ isStatic: boolean }>`
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  cursor: ${({ isStatic }) => (isStatic ? 'default' : 'pointer')};

  &:hover {
    ${Mark} {
      color: ${({ theme }) => theme.colors.grey};
    }
  }

  ${Mark} {
    margin-right: 8px;
  }

  & > * {
    z-index: 2;
  }
`;

export const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-shrink: 1;
  flex-grow: 1;
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

export const Container = styled.section<{ $border?: 'none' }>`
  display: flex;
  flex-direction: column;
  transition: border-color 200ms ease;

  & & {
    padding: 4px 8px;
    border: 1px solid ${({ theme }) => theme.colors.dark};

    ${Title} {
      ${getFontStyles('p2', 'medium')}
    }
  }

  ${({ $border }) =>
    $border == 'none' &&
    css`
      &&& {
        padding: 0;
        border: none;
      }
    `}
`;
