import React from 'react';
import styled from 'styled-components';
import { Text } from '../Text';
import { withBorder } from '../withBorder';

const Container = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;

  background: rgba(0, 0, 0, 0);
  border: 1px solid grey;
  padding: 4px 12px;
  text-decoration: none;
  cursor: pointer;
  color: #373737;

  &:not([disabled]) {
    transition: background 0.3s ease;
    cursor: pointer;

    &:hover {
      background: rgba(239, 239, 239, 1);
    }
  }
`;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const PureButton = ({ children, ...p }: ButtonProps) => (
  <Container {...p}>
    <Text variant='p3'>{children}</Text>
  </Container>
);

export const Button = withBorder(PureButton, { withQuad: false, size: 6, color: 'grey' });
