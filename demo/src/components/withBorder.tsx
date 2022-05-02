import * as React from 'react';
import styled from 'styled-components';

interface WithBorderProps {
  className?: string;
  style?: React.CSSProperties;
}
export interface WithBorderOptions {
  color?: string;
  size?: number;
  withQuad?: boolean;
  quadFillColor?: string;
}

const defaultOptions: Required<WithBorderOptions> = {
  color: 'black',
  size: 8,
  withQuad: true,
  quadFillColor: 'black',
};

export const withBorder = <P extends object, R extends React.JSXElementConstructor<P>>(
  Component: R,
  opts: WithBorderOptions = {},
): R => {
  const options = { ...defaultOptions, ...opts };
  const StyledComponent = styled(Component)`
    border: none;
  `;

  const BorderSlice = styled.i``;

  const BorderWrapper = styled.div`
    --color: ${options.color};
    --slice: ${options.size}px;

    position: relative;
    display: flex;
    border-top: 1px solid var(--color);
    border-left: 1px solid var(--color);

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
    }
    &::after {
      right: var(--slice);
      border-bottom: 1px solid var(--color);
    }

    ${BorderSlice} {
      pointer-events: none;
      &::before,
      &::after {
        content: '';
        position: absolute;
        height: var(--slice);
        width: var(--slice);
      }

      &::before {
        right: 0;
        bottom: 0;
        border-top: 1px solid var(--color);
        border-left: 1px solid var(--color);
        background-color: white;
      }
      &::after {
        content: ${options.withQuad ? "''" : 'none'};
        width: var(--slice);
        height: var(--slice);
        right: -1px;
        bottom: calc(-1 * var(--slice) - 1px);
        border: 1px solid var(--color);
        background-color: ${options.quadFillColor};
      }
    }
  `;

  const WrappedComponent = (({ className, style, ...props }: P & WithBorderProps) => (
    <BorderWrapper className={className} style={style}>
      <BorderSlice />
      {/* @ts-expect-error */}
      <StyledComponent {...(props as P)} />
    </BorderWrapper>
  )) as R;

  // @ts-expect-error
  return styled(WrappedComponent)``;
};
