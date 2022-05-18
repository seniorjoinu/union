import React from 'react';
import styled from 'styled-components';

export const Row = styled.div<{ margin?: number }>`
  display: flex;
  flex-direction: row;

  & > *:not(:last-child) {
    margin-right: ${({ margin = 8 }) => margin}px;
  }
`;

export const Column = styled.div<{ margin?: number }>`
  display: flex;
  flex-direction: column;

  & > *:not(:last-child) {
    margin-bottom: ${({ margin = 8 }) => margin}px;
  }
`;
