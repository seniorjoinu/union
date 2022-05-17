import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Tooltip } from '../Tooltip';
import { SubmitButtonProps, SubmitButton } from './SubmitButton';

const TButton = styled(SubmitButton)``;

const TooltipContent = styled.div`
  display: flex;
  flex-direction: column;

  & > *:not(:last-child) {
    margin-bottom: 8px;
  }
`;

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;

  &:hover {
    ${Tooltip} {
      max-width: 245px;
      pointer-events: all;
      opacity: 1;
    }
  }
`;

export interface TooltipButtonProps extends SubmitButtonProps {
  buttonContent?: React.ReactNode;
}

export const TooltipButton = ({
  className,
  style,
  buttonContent,
  children,
  ...props
}: TooltipButtonProps) => (
  <Container className={className} style={style}>
    <TButton {...props}>{buttonContent}</TButton>
    <Tooltip>
      <TooltipContent>{children}</TooltipContent>
    </Tooltip>
  </Container>
  );
