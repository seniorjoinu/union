import styled, { css } from 'styled-components';
import { TextWeight, TextVariant, TextFont } from './types';
import { getFontStyles } from './utils';

export interface TextProps {
  variant?: TextVariant | 'inherit';
  weight?: TextWeight;
  font?: TextFont;
  color?: string;
}

// TODO: Add semantic mapping so variant would match tag
export const Text = styled.span<TextProps>`
  margin: 0;
  padding: 0;
  text-decoration: none;

  ${({ color }) =>
    color &&
    css`
      color: ${color};
    `};
  ${({ variant = 'p2', weight = 'regular', font }) =>
    variant != 'inherit' && getFontStyles(variant, weight, font)};
`;
