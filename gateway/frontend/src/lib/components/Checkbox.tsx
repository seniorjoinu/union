import React from 'react';
import styled from 'styled-components';
import { Text } from './Text';
import { theme } from './theme';

const Icon = (p: React.SVGAttributes<SVGElement>) => (
  <svg
    width='90'
    height='90'
    viewBox='0 0 90 90'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    {...p}
  >
    <path d='M30 60H0V90H30V60Z' fill={theme.colors.dark} />
    <path d='M60 60H30V90H60V60Z' fill={theme.colors.dark} />
    <path d='M90 60H60V90H90V60Z' fill={theme.colors.dark} />
    <path d='M90 30H60V60H90V30Z' fill={theme.colors.dark} />
    <path d='M30 30H0V60H30V30Z' fill={theme.colors.dark} />
    <path d='M30 0H0V30H30V0Z' fill={theme.colors.dark} />
    <path d='M60 0H30V30H60V0Z' fill={theme.colors.dark} />
    <path d='M30.5 30.5H59.5V59.5H30.5V30.5Z' fill='currentColor' stroke={theme.colors.light} />
  </svg>
);

const Mark = styled(Icon)<{ size: number }>`
  height: ${({ size }) => size}px;
  width: ${({ size }) => size}px;
  transition: color 0.2s ease;
  color: rgba(0, 0, 0, 0);
  fill: ${({ theme }) => theme.colors.dark};
`;

const Container = styled.label`
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  & > *:not(:last-child) {
    margin-right: 8px;
  }

  & > input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }

  &:hover > input ~ ${Mark} {
    color: ${({ theme }) => theme.colors.grey};
  }

  & > input:checked ~ ${Mark} {
    color: ${({ theme }) => theme.colors.dark};
  }
`;

export interface CheckboxProps {
  className?: string;
  style?: React.CSSProperties;
  size?: number;
  checked: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  children?: React.ReactNode;
}

export const Checkbox = styled(
  ({ children, checked, onChange, size = 20, ...p }: CheckboxProps) => (
    <Container {...p}>
      <input type='checkbox' checked={checked} onChange={onChange} />
      <Mark size={size} />
      <Text variant='p3' weight='medium'>
        {children}
      </Text>
    </Container>
  ),
)``;
