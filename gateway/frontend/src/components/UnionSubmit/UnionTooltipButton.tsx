import React from 'react';
import styled from 'styled-components';
import { SubmitButton as SB, SubmitButtonProps, Column, TooltipButton } from '@union/components';
import { _SERVICE } from 'services';
import { useUnionSubmit, UnionSubmitProps, UnionSubmitResult } from './hook';

const SubmitButton = styled(SB)`
  white-space: nowrap;
`;
const Container = styled(Column)``;

export interface UnionTooltipButtonProps<
  T extends keyof _SERVICE = keyof _SERVICE,
  P = Parameters<_SERVICE[T]>
> extends SubmitButtonProps,
    UnionSubmitProps<T> {
  getPayload(): P;
  buttonContent: React.ReactNode;
  submitVotingVerbose?: React.ReactNode;
}

export const UnionTooltipButton = <T extends keyof _SERVICE = keyof _SERVICE>({
  onClick = () => {},
  onExecuted = () => {},
  canisterId,
  methodName,
  ...p
}: UnionTooltipButtonProps<T>) => {
  const submitProps = useUnionSubmit({
    canisterId,
    onClick,
    onExecuted,
    methodName,
  });

  return (
    <UnionTooltipButtonComponent
      {...p}
      {...submitProps}
      disabled={p.disabled || submitProps.submitting}
    />
  );
};

export interface UnionTooltipButtonComponentProps<
  T extends keyof _SERVICE = keyof _SERVICE,
  P = Parameters<_SERVICE[T]>
> extends SubmitButtonProps,
    UnionSubmitResult<T, P> {
  getPayload(): P;
  buttonContent: React.ReactNode;
  submitVotingVerbose?: React.ReactNode;
}

export const UnionTooltipButtonComponent = <
  T extends keyof _SERVICE = keyof _SERVICE,
  P = Parameters<_SERVICE[T]>
>({
  className,
  style,
  onClick = () => {},
  getPayload,
  children,
  buttonContent,
  submitVotingVerbose = 'Create voting',
  isAllowed,
  submitting,
  submit,
  createVoting,
  ...p
}: UnionTooltipButtonComponentProps<T, P>) => {
  if (!isAllowed) {
    return (
      <SubmitButton
        {...p}
        disabled={p.disabled || submitting}
        onClick={() => createVoting(getPayload())}
      >
        {submitVotingVerbose}
      </SubmitButton>
    );
  }
  return (
    <TooltipButton
      className={className}
      style={style}
      buttonContent={buttonContent}
      loading={submitting}
    >
      <Container>
        {isAllowed && (
          <SubmitButton
            {...p}
            disabled={p.disabled || submitting}
            onClick={(e: any) => submit(e, getPayload())}
          >
            {children}
          </SubmitButton>
        )}
        <SubmitButton
          {...p}
          disabled={p.disabled || submitting}
          onClick={() => createVoting(getPayload())}
        >
          {submitVotingVerbose}
        </SubmitButton>
      </Container>
    </TooltipButton>
  );
};
