import styled, { css } from 'styled-components';

export const Cell = styled.div<{ basis?: string; align: 'start' | 'end' | 'center' }>`
  display: flex;
  text-align: left;
  flex-basis: ${({ basis = 'auto' }) => basis};
  justify-content: ${({ align }) => (align === 'center' ? align : `flex-${align}`)};
`;

export const Container = styled.li<{ isInteractive?: boolean; variant: 'outlined' | 'contained' }>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  border: 1px solid ${({ theme }) => theme.colors.dark};
  background-color: ${({ variant, theme }) =>
    variant === 'contained' ? theme.colors.grey : 'rgba(0, 0, 0, 0)'};
  transition: border-color 0.3s ease;
  padding: 22px 24px;
  ${({ isInteractive }) =>
    isInteractive
      ? css`
          cursor: pointer;

          &:hover {
            border-color: ${({ theme }) => theme.colors.grey};
          }
        `
      : css`
          cursor: default;
        `};

  ${Cell} {
    flex-grow: 1;
    flex-shrink: 1;

    &:not(:last-child) {
      padding-right: 8px;
    }
  }
`;
