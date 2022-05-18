import React from 'react';
import styled from 'styled-components';
import { Text as T, TextVariant, TextWeight } from './Text';

const Text = styled(T)``;

const Container = styled.div<{ $align: FieldProps['align']; $margin?: number }>`
	display: flex;
	flex-direction: ${({ $align }) => $align};

	& > *:not(:last-child) {
		margin-${({ $align }) => ($align == 'row' ? 'right' : 'bottom')}: ${({ $margin = 4 }) => $margin}px;
	}

	& > ${Text}:first-child {
		&:empty {
			display: none;
		}
	}
	& > ${Text}:not(:first-child) {
		flex-grow: 1;
		&:empty {
			display: none;
		}
	}
`;

export interface FieldProps {
  className?: string;
  style?: React.CSSProperties;
  margin?: number;
  align?: 'row' | 'column';
  title?: React.ReactNode;
  children?: React.ReactNode;
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
      <Container {...p} $align={align} $margin={margin}>
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
