import styled from 'styled-components';
import { TextWeight, TextVariant } from './types';
import { getFontStyles } from './utils';

export interface TextProps {
  variant?: TextVariant;
  weight?: TextWeight;
}

// TODO: Add semantic mapping so variant would match tag
export const Text = styled.span<TextProps>`
  margin: 0;
  padding: 0;

  ${({ variant = 'p2', weight = 'regular' }) => getFontStyles(variant, weight)};
`;
