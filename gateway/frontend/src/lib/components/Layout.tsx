import React from 'react';
import styled from 'styled-components';

export const Row = styled.div<{ margin?: number }>`
  display: flex;
  flex-direction: row;

  & > *:not(:last-child) {
    margin-right: ${({ margin = 8 }) => margin}px;
  }
`;

export const Column = styled.div<{ margin?: number; marginLast?: boolean }>`
  display: flex;
  flex-direction: column;

  & > *:not(:last-child) {
    margin-bottom: ${({ margin = 8 }) => margin}px;
  }
  & > *:last-child {
    margin-bottom: ${({ marginLast, margin = 8 }) => (marginLast ? margin : 0)}px;
  }
`;

export const ShiftedColumn = styled(Column)`
  position: relative;
  margin-left: 16px;
  padding-left: 16px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 0;
    border-left: 1px solid ${({ theme }) => theme.colors.grey};
  }
`;
