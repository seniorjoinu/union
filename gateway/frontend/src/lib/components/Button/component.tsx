import React from 'react';
import styled from 'styled-components';
import { Text as T, getFontStyles } from '../Text';
import { theme } from '../theme';
import { withBorder } from '../withBorder';

const Text = styled(T)`
  display: flex;

  &,
  & > * {
    ${getFontStyles('p3', 'medium')}
  }
`;

const Container = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  background: rgba(0, 0, 0, 0);
  border: 1px solid ${({ theme }) => theme.colors.dark};
  padding: 4px 12px;
  text-decoration: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.dark};
  transition: color 0.2s ease;

  &:not([disabled]) {
    transition: background 0.3s ease;
    cursor: pointer;

    &:hover {
      color: ${({ theme }) => theme.colors.grey};
    }
  }
`;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const PureButton = ({ children, ...p }: ButtonProps) => (
  <Container {...p}>
    <Text>{children}</Text>
  </Container>
);

export const Button = withBorder(PureButton, {
  withQuad: false,
  size: 6,
  color: theme.colors.dark,
  hoverColor: theme.colors.grey,
});
