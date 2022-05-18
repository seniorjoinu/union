import styled, { css } from 'styled-components';
import { ComponentsTheme } from '../theme';
import { TextWeight, TextVariant, TextFont } from './types';
import { getFontStyles } from './utils';

type HexCode =`#${string}`;
type RGBCode =`rgb(${number}, ${number}, ${number})`;
type RGBACode =`rgba(${number}, ${number}, ${number}, ${number})`;
type HSLCode =`hsl(${number}, ${number}, ${number})`;
type HSLACode =`hsla(${number}, ${number}, ${number}, ${number})`;

export type Color = HexCode | RGBCode | RGBACode | HSLCode | HSLACode; // FIXME add NamedColor from @types/csstype
export interface TextProps {
  variant?: TextVariant | 'inherit';
  weight?: TextWeight;
  nest?: boolean;
  important?: boolean;
  font?: TextFont;
  color?: keyof ComponentsTheme['colors'] | Color;
}

// TODO: Add semantic mapping so variant would match tag
export const Text = styled.span<TextProps>`
  margin: 0;
  padding: 0;
  text-decoration: none;
  transition: color .3s ease;

  ${({ nest, important }) => (nest ? (important ? '&&& > *,' : '& > *,') : '')}
  ${({ important }) => (important ? '&&&,' : '')}
  & {
    ${({ color = '', theme }) =>
      css`
        color: ${theme.colors[color as keyof ComponentsTheme['colors']] ||
        color ||
        theme.colors.dark};
      `};
    ${({ variant = 'p2', weight = 'regular', font }) =>
      variant != 'inherit' && getFontStyles(variant, weight, font)};
  }
`;
