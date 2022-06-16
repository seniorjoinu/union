import React from 'react';
import styled from 'styled-components';
import { Text as T, TextProps } from '../Text';
import { withBorder } from '../withBorder';

const Text = styled(T)`
  display: flex;
`;

const getPadding = (variant: TextProps['variant']) => {
  if (variant == 'caption') {
    return '2px 10px';
  }
  if (variant?.startsWith('p')) {
    return '4px 12px';
  }
  if (variant?.startsWith('h')) {
    return '6px 16px';
  }
  return '4px 12px';
};

const Container = styled.button<{ $variant: TextProps['variant'] }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  background: rgba(0, 0, 0, 0);
  border: 1px solid ${({ theme }) => theme.colors.dark};
  padding: ${({ $variant }) => getPadding($variant)};
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

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  weight?: TextProps['weight'];
  variant?: TextProps['variant'];
  color?: TextProps['color'];
}

export const PureButton = ({
  children,
  variant = 'p3',
  color,
  weight = 'medium',
  ...p
}: ButtonProps) => (
  <Container {...p} $variant={variant}>
    <Text variant={variant} color={color} weight={weight} nest>
      {children}
    </Text>
  </Container>
);

export const Button = withBorder(PureButton, {
  withQuad: false,
  size: 6,
  color: 'dark',
  hoverColor: 'grey',
});
