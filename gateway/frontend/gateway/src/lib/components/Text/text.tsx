import styled, { css } from 'styled-components';
import { TextWeight, TextVariant } from './types';
import { getFontStyles } from './utils';

export interface TextProps {
  variant?: TextVariant | 'inherit';
  weight?: TextWeight;
  color?: string;
}

// TODO: Add semantic mapping so variant would match tag
export const Text = styled.span<TextProps>`
  margin: 0;
  padding: 0;

  ${({ color }) =>
    color &&
    css`
      color: ${color};
    `};
  ${({ variant = 'p2', weight = 'regular' }) =>
    variant != 'inherit' && getFontStyles(variant, weight)};
`;
