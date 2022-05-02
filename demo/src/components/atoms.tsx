import React from 'react';
import styled from 'styled-components';
import MD from 'react-markdown';
import { withBorder } from './withBorder';

export const PureButton = styled.button`
  display: flex;
  background: rgba(0, 0, 0, 0);
  border: 1px solid grey;
  padding: 4px 12px;
  font-size: 16px;

  &:not([disabled]) {
    transition: background 0.3s ease;
    cursor: pointer;

    &:hover {
      background: rgba(239, 239, 239, 1);
    }
  }
`;

export const Button = withBorder(PureButton, { withQuad: false, size: 6, color: 'grey' });

export const Principal = styled.span`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  max-width: 100px;
  align-self: center;
  cursor: pointer;
`;

export const TextArea = styled.textarea`
  outline: none;
  resize: vertical;
  font-size: 16px;
  border: 1px solid grey;

  &::-webkit-resizer {
    display: none;
  }
`;

export const TextField = styled.input`
  outline: none;
  font-size: 16px;
  padding: 4px 8px;
  border: 1px solid grey;
`;

export const Markdown = styled(MD)`
  & > * {
    &:first-child {
      margin-top: 0;
    }
    &:last-child {
      margin-bottom: 0;
    }
  }

  code {
    white-space: pre-line;
  }

  a {
    color: grey;
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
      color: black;
    }
  }
`;

const BordererdDiv = withBorder(styled.div``);

export const Tooltip = styled(({ children, ...p }: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...p}>
    <BordererdDiv>{children}</BordererdDiv>
  </div>
))`
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;
  position: absolute;
  top: 100%;
  left: 50%;
  z-index: 2;
  transform: translate(-50%, 0);
  padding: 6px 4px 4px;

  & > div {
    display: flex;
    flex-direction: column;
    padding: 8px;
    background-color: white;
  }
`;

export const Logo = styled((p: React.SVGAttributes<SVGElement>) => (
  <svg
    {...p}
    width='78'
    height='78'
    viewBox='0 0 78 78'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path d='M52 0H26V26H52V0Z' fill='black' />
    <path d='M52 26H26V52H52V26Z' fill='black' />
    <path d='M52 52H26V78H52V52Z' fill='black' />
    <path d='M78 26H52V52H78V26Z' fill='black' />
    <path d='M78 0H52V26H78V0Z' fill='black' />
    <path d='M26 0H0V26H26V0Z' fill='black' />
  </svg>
))`
  height: 30px;
  width: 30px;
`;

const DEFAULT_SPINNER_SIZE = 10;

export const Spinner = styled.div<{ size?: number }>`
  --color: black;
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

export const SubmitButton = styled(({ children, ...p }: React.ComponentProps<typeof Button>) => (
  <Button {...p}>
    <Spinner size={20} />
    <span>{children}</span>
  </Button>
))<{ $loading: boolean }>`
  position: relative;

  ${Spinner} {
    position: absolute;
    top: calc(50% - 10px);
    left: calc(50% - 10px);
    opacity: ${({ $loading }) => ($loading ? 1 : 0)};
  }
  button > span {
    opacity: ${({ $loading }) => ($loading ? 0 : 1)};
  }
  ${Spinner}, & > span {
    transition: opacity 0.2s ease;
  }
`;
