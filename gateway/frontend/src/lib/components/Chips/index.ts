import styled, { css } from 'styled-components';
import { Text, TextProps } from '../Text';

const getPadding = (variant: TextProps['variant']) => {
  if (variant == 'caption') {
    return '0px 4px';
  }
  if (variant?.startsWith('p')) {
    return '0px 8px';
  }
  return '0px 4px';
};

export const Chips = styled(Text)`
  cursor: default;
  transition: color 0.2s ease;
  border: 1px solid ${({ theme }) => theme.colors.grey};
  padding: ${({ variant }) => getPadding(variant)};

  ${({ theme, color }) =>
    !color
      ? css`
          color: ${theme.colors.grey};
          &:hover {
            color: ${({ theme }) => theme.colors.dark};
          }
        `
      : ''};
`;
