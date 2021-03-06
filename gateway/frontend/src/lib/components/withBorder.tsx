import * as React from 'react';
import styled, { css } from 'styled-components';
import { TextProps } from './Text';
import { ComponentsTheme } from './theme';

interface WithBorderProps {
  className?: string;
  style?: React.CSSProperties;
  as?: any;
  noBorder?: boolean;
  borderColor?: TextProps['color'];
}
export interface WithBorderOptions {
  color?: TextProps['color'];
  hoverColor?: TextProps['color'];
  size?: number;
  withQuad?: boolean;
  quadFillColor?: TextProps['color'];
  hoverQuadFillColor?: TextProps['color'];
}

const defaultOptions: WithBorderOptions = {
  color: 'grey',
  size: 8,
  withQuad: true,
  quadFillColor: 'dark',
};

export const withBorder = <
  P extends object,
  R extends React.JSXElementConstructor<P> = React.JSXElementConstructor<P>
>(
  Component: R,
  opts: WithBorderOptions = {},
): R => {
  const options = { ...defaultOptions, ...opts };
  const StyledComponent = styled(Component)`
    border: none;
  `;

  const BorderSlice = styled.i``;

  const BorderWrapper = styled.div<{
    $disabled: boolean;
    $noBorder: boolean;
    $borderColor?: TextProps['color'];
  }>`
    --color: ${({ theme, $borderColor }) =>
      theme.colors[$borderColor as keyof ComponentsTheme['colors']] ||
      $borderColor ||
      theme.colors[options.color as keyof ComponentsTheme['colors']] ||
      options.color};
    --hover-color: ${({ theme }) =>
      theme.colors[options.hoverColor as keyof ComponentsTheme['colors']] ||
      options.hoverColor ||
      'var(--color)'};
    --quad-fill-color: ${({ theme }) =>
      theme.colors[options.quadFillColor as keyof ComponentsTheme['colors']] ||
      options.quadFillColor};
    --bg-color: ${({ theme }) =>
      theme.colors[options.hoverQuadFillColor as keyof ComponentsTheme['colors']] ||
      options.hoverQuadFillColor ||
      'var(--quad-fill-color)'};

    --slice: ${options.size}px;

    position: relative;
    display: flex;
    border-top: 1px solid var(--color);
    border-left: 1px solid var(--color);
    transition: border-color 0.2s ease;
    padding: 0 1px 1px 0;
    ${({ $disabled }) =>
      ($disabled
        ? css`
            pointer-events: none;
            opacity: 0.5;
          `
        : '')}

    &:hover {
      border-color: var(--hover-color);

      &::before,
      &::after {
        border-color: var(--hover-color);
      }
    }
    &:hover ${BorderSlice} {
      &::before {
        border-color: var(--hover-color);
      }
      &::after {
        border-color: var(--hover-color);
        background-color: var(--bg-color);
      }
    }

    & > ${StyledComponent} {
      width: 100%;
    }

    &::before,
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
    }

    &::before {
      bottom: var(--slice);
      border-right: 1px solid var(--color);
      transition: border-color 0.2s ease;
    }
    &::after {
      right: var(--slice);
      border-bottom: 1px solid var(--color);
      transition: border-color 0.2s ease;
    }

    ${BorderSlice} {
      pointer-events: none;
      &::before,
      &::after {
        content: '';
        position: absolute;
        height: var(--slice);
        width: var(--slice);
        transition: background-color, border-color 0.2s ease;
      }

      &::before {
        right: 0;
        bottom: 0;
        border-top: 1px solid var(--color);
        border-left: 1px solid var(--color);
        background-color: ${({ theme }) => theme.colors.light};
      }
      &::after {
        content: ${options.withQuad ? "''" : 'none'};
        width: var(--slice);
        height: var(--slice);
        right: -1px;
        bottom: calc(-1 * var(--slice) - 1px);
        border: 1px solid var(--color);
        background-color: var(--quad-fill-color);
      }
    }

    ${({ $noBorder }) =>
      ($noBorder
        ? css`
            border-top: none;
            border-left: none;

            ${BorderSlice} {
              display: none;
            }

            &::before,
            &::after {
              content: none;
            }
          `
        : '')}
  `;

  const WrappedComponent = (React.forwardRef<HTMLElement, P & WithBorderProps>(
    ({ className, style, as, noBorder, borderColor, ...props }, ref) => (
      <BorderWrapper
        className={className}
        style={style}
        $disabled={!!(props as any).disabled}
        $noBorder={!!noBorder}
        $borderColor={borderColor}
      >
        <BorderSlice />
        {/* @ts-expect-error */}
        <StyledComponent {...(props as P)} forwardedAs={as} ref={ref} />
      </BorderWrapper>
    ),
  ) as unknown) as R;

  // @ts-expect-error
  return styled(WrappedComponent)``;
};
