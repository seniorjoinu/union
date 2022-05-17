import React, { useCallback, useEffect, useState } from 'react';
import { SubmitButtonProps } from '@union/components';
import { useAuth, useUnion, _SERVICE, unionEncoder, unionDecoder } from 'services';
import { useNavigate } from 'react-router-dom';
import { Unpromise } from 'toolkit';
import { Principal } from '@dfinity/principal';

export interface UnionSubmitProps<
  T extends keyof _SERVICE = keyof _SERVICE,
  P = Parameters<_SERVICE[T]>,
  R = Unpromise<ReturnType<_SERVICE[T]>>
> extends Pick<SubmitButtonProps, 'onClick'> {
  canisterId: Principal;
  methodName: T;
  onExecuted?(payload: P, result: R): void;
}

export interface UnionSubmitResult<
  T extends keyof _SERVICE = keyof _SERVICE,
  P = Parameters<_SERVICE[T]>
> {
  isAllowed: boolean;
  submitting: boolean;
  submit(e: React.MouseEvent<HTMLButtonElement>, payload: P): Promise<ReturnType<_SERVICE[T]>>;
  createVoting(payload: P): void;
}

export const useUnionSubmit = <
  T extends keyof _SERVICE = keyof _SERVICE,
  P = Parameters<_SERVICE[T]>
>({
  canisterId,
  methodName,
  onClick = () => {},
  onExecuted = () => {},
}: UnionSubmitProps<T, P>): UnionSubmitResult<T, P> => {
  const [submitting, setSubmitting] = useState(false);
  const nav = useNavigate();
  const { identity } = useAuth();
  const { canister, getMethodAccess, methodAccess } = useUnion(canisterId);

  useEffect(() => {
    if (!identity) {
      return;
    }

    getMethodAccess({
      methodName,
      profile: identity.getPrincipal(),
    });
  }, []);

  const submit = useCallback(
    async (
      e: React.MouseEvent<HTMLButtonElement>,
      payload: P,
    ): Promise<ReturnType<_SERVICE[T]>> => {
      setSubmitting(true);
      try {
        onClick(e);

        const accessConfig = methodAccess[methodName][0];

        if (!accessConfig) {
          throw new Error('No access');
        }

        // @ts-expect-error
        const encoded = unionEncoder[methodName](...(payload || []));

        const { result } = await canister.execute({
          access_config_id: accessConfig.id[0]!,
          program: {
            RemoteCallSequence: [
              {
                endpoint: { canister_id: canisterId, method_name: methodName },
                cycles: BigInt(0),
                args: { Encoded: [...new Uint8Array(encoded)] },
              },
            ],
          },
        });

        if (!('RemoteCallSequence' in result)) {
          throw new Error('No RemoteCallSequence result');
        }

        const response = result.RemoteCallSequence[0];

        if (!response) {
          throw new Error('Empty length of RemoteCallSequence');
        }
        if ('Err' in response) {
          throw new Error(`${response.Err[0]}: ${response.Err[1]}`);
        }

        const { buffer } = new Uint8Array(response.Ok);

        // @ts-expect-error
        const decodedResult = (await unionDecoder[methodName](buffer))[0] as Unpromise<
          ReturnType<_SERVICE[T]>
        >;

        onExecuted(payload, decodedResult);
        setSubmitting(false);

        return decodedResult;
      } catch (e) {
        setSubmitting(false);
        throw e;
      }
    },
    [methodName, methodAccess, onClick, onExecuted, setSubmitting],
  );

  const createVoting = useCallback(
    (payload: P) => {
      const state = {
        methodName,
        payload,
      };

      nav(`/wallet/${canisterId}/execute`, { state });
    },
    [methodName, canisterId],
  );

  const isAllowed = !!methodAccess[methodName]?.length;

  return {
    isAllowed,
    submitting,
    submit,
    createVoting,
  };
};
