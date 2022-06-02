import React from 'react';
import styled, { css } from 'styled-components';

export const Row = styled.div<{ margin?: number }>`
  display: flex;
  flex-direction: row;

  & > *:not(:last-child) {
    margin-right: ${({ margin = 8 }) => margin}px;
  }
`;

export const Column = styled.div<{ margin?: number; marginLast?: boolean; $disabled?: boolean }>`
  display: flex;
  flex-direction: column;
  ${({ $disabled }) =>
    ($disabled
      ? css`
          pointer-events: none;
          opacity: 0.5;
        `
      : '')};

  & > *:not(:last-child) {
    margin-bottom: ${({ margin = 8 }) => margin}px;
  }
  & > *:last-child {
    margin-bottom: ${({ marginLast, margin = 8 }) => (marginLast ? margin : 0)}px;
  }
`;

export const ShiftedColumn = styled(Column)<{ withSeparator?: boolean }>`
  position: relative;
  margin-left: 8px;
  padding-left: ${({ withSeparator = true }) => (withSeparator ? '8px' : '0')};

  &::before {
    display: ${({ withSeparator = true }) => (withSeparator ? 'block' : 'none')};
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 0;
    border-left: 1px solid ${({ theme }) => theme.colors.grey};
  }
`;
