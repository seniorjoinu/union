import React from 'react';
import styled from 'styled-components';
import { SubmitButton, SubmitButtonProps, Row } from '@union/components';
import { _SERVICE, DeployerService, GatewayService } from 'services';
import { useUnionSubmit, UnionSubmitProps, EncDec, AnyService } from './hook';

const Container = styled(Row)``;

type SERVICE = AnyService & _SERVICE;
export interface UnionExternalSubmitButtonProps<
  S extends AnyService = SERVICE,
  T extends keyof S = keyof S,
  P = Parameters<S[T]>
> extends SubmitButtonProps,
    UnionSubmitProps<S, T> {
  getPayload(methodName: T): P;
  submitVotingVerbose?: React.ReactNode;
}

export const UnionExternalSubmitButton = <
  S extends AnyService = SERVICE,
  T extends keyof S = keyof S
>({
  className,
  style,
  onClick = () => {},
  onExecuted = () => {},
  canisterId,
  unionId,
  methodName,
  getPayload,
  children,
  submitVotingVerbose = 'Create voting',
  ...p
}: UnionExternalSubmitButtonProps<S, T> & EncDec) => {
  const { isAllowed, submitting, submit, createVoting } = useUnionSubmit<S>({
    unionId,
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

export type UnionSubmitButtonProps<T extends keyof _SERVICE> = UnionExternalSubmitButtonProps<
  SERVICE,
  T
> &
  EncDec;

export const UnionSubmitButton = <T extends keyof _SERVICE>(p: UnionSubmitButtonProps<T>) => (
  <UnionExternalSubmitButton {...p} />
);

export type DeployerSubmitButtonProps<
  T extends keyof DeployerService
> = UnionExternalSubmitButtonProps<DeployerService & AnyService, T> & EncDec;

export const DeployerSubmitButton = <T extends keyof DeployerService>(
  p: DeployerSubmitButtonProps<T>,
) => <UnionExternalSubmitButton {...p} />;

export type GatewaySubmitButtonProps<
  T extends keyof GatewayService
> = UnionExternalSubmitButtonProps<GatewayService & AnyService, T> & EncDec;

export const GatewaySubmitButton = <T extends keyof GatewayService>(
  p: GatewaySubmitButtonProps<T>,
) => <UnionExternalSubmitButton {...p} />;
