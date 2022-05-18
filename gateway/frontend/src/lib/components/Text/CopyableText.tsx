import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import { Text, TextProps } from './text';

const Alert = styled(Text)`
  color: ${({ theme }) => theme.colors.dark};
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${({ theme }) => theme.colors.light};
    opacity: 0.9;
    z-index: -1;
    pointer-events: none;
  }
`;

const Container = styled(Text)`
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.grey};

  ${Alert} {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  &:hover {
    color: ${({ theme }) => theme.colors.dark};
  }
  &:hover ${Alert} {
    opacity: 1;
  }
`;

export interface CopyableTextProps extends TextProps {
  copyText?: string | null | void;
  alertText?: React.ReactNode;
  alertCopiedText?: React.ReactNode;
  children?: string | null | void;
}

export const CopyableText = styled(
  ({
    children,
    copyText = children,
    alertText = 'Copy',
    alertCopiedText = 'Copied!',
    ...p
  }: CopyableTextProps) => {
    const [text, setText] = useState(alertText);
    const handleCopy = useCallback(() => {
      navigator.clipboard.writeText(copyText || '');
      setText(alertCopiedText);
      setTimeout(() => setText(alertText), 1000);
    }, [copyText, setText, alertCopiedText, alertText]);

    return (
      <Container {...p} onClick={handleCopy}>
        {children || ''}
        <Alert>{text}</Alert>
      </Container>
    );
  },
)``;
