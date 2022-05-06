import * as React from 'react';
import { TextProps } from '../Text';
import { Progress } from '../Progress';
import { Container, Id } from './styles';
import { cropString } from './utils';

export interface CroppedStringProps extends Partial<Pick<TextProps, 'variant' | 'weight'>> {
  className?: string;
  style?: React.CSSProperties;
  loading?: boolean;
  startLen?: number;
  endLen?: number;
  onClick?(e: React.MouseEvent): void;
  children: string;
}

export const CroppedString: React.FC<CroppedStringProps> = ({
  className = '',
  style,
  startLen = 7,
  endLen = 5,
  children,
  variant = 'p3',
  weight = 'regular',
  ...p
}) =>
  (p.loading ? (
    <Progress className={className} style={style} size={22} />
  ) : (
    <Container className={className} style={style} onClick={p.onClick}>
      <Id variant={variant} weight={weight} len={startLen + endLen}>
        {cropString(children, startLen, endLen)}
      </Id>
    </Container>
  ));
