import React from 'react';
import styled from 'styled-components';
import { SubmitButton, SubmitButtonProps, Row } from '@union/components';
import { _SERVICE } from 'services';
import { useUnionSubmit, UnionSubmitProps } from './hook';

const Container = styled(Row)``;

export interface UnionSubmitButtonProps<
  T extends keyof _SERVICE = keyof _SERVICE,
  P = Parameters<_SERVICE[T]>
> extends SubmitButtonProps,
    UnionSubmitProps<T> {
  getPayload(methodName: T): P;
  submitVotingVerbose?: React.ReactNode;
}

export const UnionSubmitButton = <T extends keyof _SERVICE = keyof _SERVICE>({
  className,
  style,
  onClick = () => {},
  onExecuted = () => {},
  canisterId,
  methodName,
  getPayload,
  children,
  submitVotingVerbose = 'Create voting',
  ...p
}: UnionSubmitButtonProps<T>) => {
  const { isAllowed, submitting, submit, createVoting } = useUnionSubmit({
    canisterId,
    onClick,
    onExecuted,
    methodName,
  });

  return (
    <Container className={className} style={style}>
      {isAllowed && (
        <SubmitButton
          {...p}
          disabled={p.disabled || submitting}
          onClick={(e) => submit(e, getPayload(methodName))}
        >
          {children}
        </SubmitButton>
      )}
      <SubmitButton
        {...p}
        disabled={p.disabled || submitting}
        onClick={() => createVoting(getPayload(methodName))}
      >
        {submitVotingVerbose}
      </SubmitButton>
    </Container>
  );
};
