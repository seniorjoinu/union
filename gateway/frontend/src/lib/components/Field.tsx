import React from 'react';
import styled, { css } from 'styled-components';
import { getFontStyles, Text as T, TextVariant, TextWeight } from './Text';

const Text = styled(T)``;

const Container = styled.div<{
  $align: FieldProps['align'];
  $margin?: number;
  $text?: string;
  $disabled?: boolean;
}>`
	display: flex;
	flex-direction: ${({ $align }) => $align};
  ${({ $disabled }) =>
    ($disabled
      ? css`
          pointer-events: none;
          opacity: 0.5;
        `
      : '')};

	& > *:not(:last-child) {
		margin-${({ $align }) => ($align == 'row' ? 'right' : 'bottom')}: ${({ $margin = 4 }) => $margin}px;
	}

	& > ${Text}:first-child {
    position: relative;
		&:empty {
			display: none;
		}
      &::before {
    content: ${({ $text }) => ($text ? `"${$text}"` : 'none')};
    position: absolute;
    bottom: 2px;
    left: 0;
    right: 0;
    transform: translateY(100%);
    color: ${({ theme }) => theme.colors.red};
    ${getFontStyles('caption', 'regular')}
  }
	}
	& > ${Text}:not(:first-child) {
		flex-grow: 1;
		&:empty {
			display: none;
		}

    &, * {
      white-space: pre-line;
    }
	}
`;

export interface FieldProps {
  className?: string;
  style?: React.CSSProperties;
  margin?: number;
  align?: 'row' | 'column';
  disabled?: boolean;
  title?: React.ReactNode;
  children?: React.ReactNode;
  helperText?: string;
  variant?: {
    title?: TextVariant;
    value?: TextVariant;
  };
  weight?: {
    title?: TextWeight;
    value?: TextWeight;
  };
}

export const Field = styled(
  ({
    children,
    title,
    margin,
    helperText,
    disabled,
    align = 'column',
    variant: propVariant,
    weight: propWeight,
    ...p
  }: FieldProps) => {
    const variant: FieldProps['variant'] = {
      title: 'p2',
      value: 'p2',
      ...propVariant,
    };
    const weight: FieldProps['weight'] = {
      title: 'regular',
      value: 'regular',
      ...propWeight,
    };

    return (
      <Container {...p} $align={align} $margin={margin} $text={helperText} $disabled={disabled}>
        <Text variant={variant.title} weight={weight.title} color='dark'>
          {title}
          {!!title && align == 'row' ? ':' : ''}
        </Text>
        <Text variant={variant.value} weight={weight.value} color='grey'>
          {children}
        </Text>
      </Container>
    );
  },
)``;
