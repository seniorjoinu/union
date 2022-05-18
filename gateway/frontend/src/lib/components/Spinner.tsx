import React from 'react';
import styled from 'styled-components';

export const DEFAULT_SPINNER_SIZE = 10;

export const Spinner = styled.div<{ size?: number }>`
  --color: ${({ theme }) => theme.colors.dark};
  --size-square: ${({ size = DEFAULT_SPINNER_SIZE }) => size / 2}px;

  display: grid;
  position: relative;
  width: ${({ size = DEFAULT_SPINNER_SIZE }) => size}px;
  height: ${({ size = DEFAULT_SPINNER_SIZE }) => size}px;
  place-items: center;

  &::before,
  &::after {
    content: '';
    box-sizing: border-box;
    position: absolute;
    width: var(--size-square);
    height: var(--size-square);
    background-color: var(--color);
  }

  &::before {
    top: calc(50% - var(--size-square));
    left: calc(50% - var(--size-square));
    animation: quad-loader-1 2.4s cubic-bezier(0, 0, 0.24, 1.21) infinite;
  }

  &::after {
    top: 50%;
    left: 50%;
    animation: quad-loader-2 2.4s cubic-bezier(0, 0, 0.24, 1.21) infinite;
  }

  @keyframes quad-loader-2 {
    0%,
    100% {
      transform: none;
    }

    25% {
      transform: translateX(-100%);
    }

    50% {
      transform: translateX(-100%) translateY(-100%);
    }

    75% {
      transform: translateY(-100%);
    }
  }

  @keyframes quad-loader-1 {
    0%,
    100% {
      transform: none;
    }

    25% {
      transform: translateX(100%);
    }

    50% {
      transform: translateX(100%) translateY(100%);
    }

    75% {
      transform: translateY(100%);
    }
  }
`;
