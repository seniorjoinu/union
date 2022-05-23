import React from 'react';
import styled from 'styled-components';
import { getFontStyles, Text } from './Text';
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
    <path d='M30 60H0V90H30V60Z' />
    <path d='M60 60H30V90H60V60Z' />
    <path d='M90 60H60V90H90V60Z' />
    <path d='M90 30H60V60H90V30Z' />
    <path d='M30 30H0V60H30V30Z' />
    <path d='M30 0H0V30H30V0Z' />
    <path d='M60 0H30V30H60V0Z' />
    <path d='M30.5 30.5H59.5V59.5H30.5V30.5Z' fill='currentColor' stroke={theme.colors.light} />
  </svg>
);

const Mark = styled(Icon)<{ size: number }>`
  height: ${({ size }) => size}px;
  width: ${({ size }) => size}px;
  transition: color 0.2s ease;
  color: rgba(0, 0, 0, 0);
  fill: ${({ theme }) => theme.colors.grey};
`;

const Container = styled.label<{ $text?: string }>`
  position: relative;
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
    color: ${({ theme }) => theme.colors.grey};
  }

  &::before {
    content: ${({ $text }) => ($text ? `"${$text}"` : 'none')};
    position: absolute;
    bottom: 2px;
    left: 0;
    right: 0;
    transform: translateY(100%);
    color: ${({ theme }) => theme.colors.red};
    ${getFontStyles('caption', 'regular')}
  }
`;

export interface CheckboxProps {
  className?: string;
  style?: React.CSSProperties;
  size?: number;
  checked: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  children?: React.ReactNode;
  helperText?: string;
}

export const Checkbox = styled(
  ({ children, checked, onChange, size = 20, helperText, ...p }: CheckboxProps) => (
    <Container {...p} $text={helperText}>
      <input type='checkbox' checked={checked} onChange={onChange} />
      <Mark size={size} />
      {children && (
        <Text variant='p3' weight='medium'>
          {children}
        </Text>
      )}
    </Container>
  ),
)``;
