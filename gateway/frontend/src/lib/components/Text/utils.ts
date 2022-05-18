import { css, FlattenSimpleInterpolation } from 'styled-components';
import { TextVariant, TextWeight, TextFont } from './types';

export interface FontParams {
  size: number;
  lineHeight: number;
  weight: number;
  paragraph: number;
  font: string;
}

export const FONT_PARAMS: Record<TextVariant, Record<TextWeight, FontParams>> = {
  h1: {
    regular: { size: 48, lineHeight: 56, weight: 400, paragraph: 28, font: 'Stolzl' },
    medium: { size: 48, lineHeight: 56, weight: 600, paragraph: 28, font: 'Stolzl' },
  },
  h2: {
    regular: { size: 40, lineHeight: 48, weight: 400, paragraph: 24, font: 'Stolzl' },
    medium: { size: 40, lineHeight: 48, weight: 600, paragraph: 24, font: 'Stolzl' },
  },
  h3: {
    regular: { size: 32, lineHeight: 40, weight: 400, paragraph: 20, font: 'Stolzl' },
    medium: { size: 32, lineHeight: 40, weight: 600, paragraph: 20, font: 'Stolzl' },
  },
  h4: {
    regular: { size: 24, lineHeight: 32, weight: 400, paragraph: 16, font: 'Stolzl' },
    medium: { size: 24, lineHeight: 32, weight: 600, paragraph: 16, font: 'Stolzl' },
  },
  h5: {
    regular: { size: 20, lineHeight: 30, weight: 400, paragraph: 14, font: 'Stolzl' },
    medium: { size: 20, lineHeight: 30, weight: 600, paragraph: 14, font: 'Stolzl' },
  },
  p1: {
    regular: { size: 18, lineHeight: 26, weight: 400, paragraph: 12, font: 'OpenSans' },
    medium: { size: 18, lineHeight: 26, weight: 600, paragraph: 12, font: 'Stolzl' },
  },
  p2: {
    regular: { size: 16, lineHeight: 24, weight: 400, paragraph: 12, font: 'OpenSans' },
    medium: { size: 16, lineHeight: 24, weight: 600, paragraph: 12, font: 'Stolzl' },
  },
  p3: {
    regular: { size: 14, lineHeight: 22, weight: 400, paragraph: 10, font: 'OpenSans' },
    medium: { size: 14, lineHeight: 22, weight: 600, paragraph: 10, font: 'Stolzl' },
  },
  caption: {
    regular: { size: 12, lineHeight: 20, weight: 400, paragraph: 8, font: 'OpenSans' },
    medium: { size: 12, lineHeight: 20, weight: 600, paragraph: 8, font: 'Stolzl' },
  },
};

export function getFontStyles(
  textVariant: TextVariant,
  textWeight: TextWeight,
  font?: TextFont,
): FlattenSimpleInterpolation {
  const { size, lineHeight, weight, font: fontParam } = FONT_PARAMS[textVariant][textWeight];

  return css`
    font-family: -apple-system, ${font || fontParam}, sans-serif;
    font-size: ${size}px;
    line-height: ${lineHeight}px;
    font-weight: ${weight};
  `;
}
