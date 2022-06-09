import React from 'react';
import styled, { css } from 'styled-components';
import { getFontStyles, Text } from './Text';

const Container = styled.label<{ $text?: string; $disabled?: boolean }>`
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
  ${({ $disabled }) =>
    ($disabled
      ? css`
          pointer-events: none;
          opacity: 0.5;
        `
      : '')};

  & > *:not(:last-child) {
    margin-right: 8px;
  }

  & > input {
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
  disabled?: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  children?: React.ReactNode;
  helperText?: string;
}

export const Checkbox = styled(
  ({ children, checked, onChange, size = 20, helperText, disabled, ...p }: CheckboxProps) => (
    <Container {...p} $text={helperText} $disabled={disabled}>
      <input type='checkbox' checked={checked} onChange={onChange} disabled={disabled} />
      {children && (
        <Text variant='p3' weight='medium'>
          {children}
        </Text>
      )}
    </Container>
  ),
)``;
