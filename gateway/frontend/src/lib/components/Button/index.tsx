import React from 'react';
import styled from 'styled-components';
import { Text } from '../Text';

const Container = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;

  background: none;
  border: 1px solid grey;
  border-radius: 4px;
  padding: 4px 8px;
  text-decoration: none;
  cursor: pointer;
`;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'text' | 'outlined';
  size?: 'M' | 'L';
  color?: string;
}

export const Button = ({ children, ...p }: ButtonProps) => (
  <Container {...p}>
    <Text variant='p3'>{children}</Text>
  </Container>
);
