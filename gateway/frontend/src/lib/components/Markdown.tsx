import MD from 'react-markdown';
import styled from 'styled-components';
import { getFontStyles } from './Text';

export const Markdown = styled(MD)`
  color: ${({ theme }) => theme.colors.dark};
  &&&,
  &&& * {
    white-space: normal;
  }

  h1 {
    ${getFontStyles('h1', 'medium')};
  }
  h2 {
    ${getFontStyles('h2', 'medium')};
  }
  h3 {
    ${getFontStyles('h3', 'medium')};
  }
  h4 {
    ${getFontStyles('h4', 'medium')};
  }
  h5 {
    ${getFontStyles('h5', 'medium')};
  }
  h6 {
    ${getFontStyles('p1', 'medium')};
  }

  & > * {
    &:first-child {
      margin-top: 0;
    }
    &:last-child {
      margin-bottom: 0;
    }
  }

  code {
    white-space: pre-line;
  }

  a {
    color: ${({ theme }) => theme.colors.grey};
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
      color: ${({ theme }) => theme.colors.dark};
    }
  }
`;
