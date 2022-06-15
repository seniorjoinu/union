import React, { useCallback, useEffect, useState } from 'react';
import { SubmitButtonProps } from '@union/components';
import { useAuth, useUnion, _SERVICE, unionIdl } from 'services';
import { useNavigate } from 'react-router-dom';
import { Unpromise } from 'toolkit';
import { Principal } from '@dfinity/principal';
import { buildDecoder, buildEncoder } from '@union/serialize';
import { MessageData } from '@union/client';

export interface AnyService {
  [key: string]: (...args: any[]) => any;
}

export type Encoder = { [key: string]: (...args: any[]) => ArrayBuffer };
export type Decoder = { [key: string]: (bytes: ArrayBuffer) => any };

export interface UnionSubmitProps<
  S extends AnyService,
  T extends keyof S = keyof S,
  P = Parameters<S[T]>,
  R = Unpromise<ReturnType<S[T]>>
> extends Pick<SubmitButtonProps, 'onClick'> {
  unionId: Principal;
  canisterId: Principal;
  methodName: T;
  onExecuted?(payload: P, result: R): void;
}

export type EncDec =
  | ({} & {
      encode(x: any): ArrayBuffer;
      decode(x: any): any;
    })
  | ({} & {
      encode?: never;
      decode?: never;
    });

export interface UnionSubmitResult<
  S extends AnyService,
  T extends keyof S = keyof S,
  P = Parameters<S[T]>
> {
  isAllowed: boolean;
  submitting: boolean;
  submit(e: React.MouseEvent<HTMLButtonElement>, payload: P): Promise<ReturnType<S[T]>>;
  createVoting(payload: P): void;
}

export const useUnionSubmit = <
  S extends AnyService,
  T extends keyof S = keyof S,
  P = Parameters<S[T]>
>({
  canisterId,
  methodName: propMethodName,
  unionId,
  onClick = () => {},
  onExecuted = () => {},
  encode,
  decode,
}: UnionSubmitProps<S, T, P> & EncDec): UnionSubmitResult<S, T, P> => {
  const [submitting, setSubmitting] = useState(false);
  const nav = useNavigate();
  const { identity } = useAuth();
  const { canister, getMethodAccess, methodAccess } = useUnion<S>(unionId);
  const methodName = String(propMethodName);

  useEffect(() => {
    if (!identity) {
      return;
    }

    getMethodAccess({
      program: [
        {
          canisterId,
          methodName,
        },
      ],
      profile: identity.getPrincipal(),
    });
  }, []);

  const submit = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>, payload: P): Promise<ReturnType<S[T]>> => {
      setSubmitting(true);
      try {
        onClick(e);

        const accessConfig = methodAccess[methodName][0];

        if (!accessConfig) {
          throw new Error('No access');
        }

        const encoder = buildEncoder(unionIdl) as Encoder;

        console.log(`\x1b[33mexecute [${methodName}]`, payload);
        // @ts-expect-error
        const encoded = encode ? encode(payload) : encoder[methodName](...(payload || []));

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

        const decoder = buildDecoder(unionIdl) as Decoder;
        const decodedResult = (decode
          ? decode(buffer)
          : (await decoder[methodName](buffer))[0]) as Unpromise<ReturnType<S[T]>>;

        onExecuted(payload, decodedResult);
        setSubmitting(false);

        return decodedResult as ReturnType<S[T]>;
      } catch (e) {
        setSubmitting(false);
        throw e;
      }
    },
    [methodName, methodAccess, onClick, onExecuted, setSubmitting],
  );

  const createVoting = useCallback(
    async (payload: P) => {
      const principal = identity?.getPrincipal();
      let name = principal ? principal.toString() : '';
      if (principal) {
        try {
          const profileName = (
            await canister.get_profile({ id: principal, query_delegation_proof_opt: [] })
          )?.profile.name;
          name = `${profileName} (${name})`;
        } catch (e) {}
      }

      const encoder = buildEncoder(unionIdl) as Encoder;

      console.log(`\x1b[33mcreate voting [${methodName}]`, payload);
      const encoded = encode ? encode(payload) : encoder[methodName](...(payload || []));

      const state: MessageData = {
        voting: {
          name: `Execution of ${methodName}`,
          description: `User "${name}" propose to execute "${methodName}". This is automatic messsage.`,
          winners_need: 1,
        },
        choices: [
          {
            name: `Approve method execution`,
            description: `I agree with execution of "${methodName}"`,
            program: {
              RemoteCallSequence: [
                {
                  endpoint: {
                    canister_id: canisterId,
                    method_name: methodName,
                  },
                  cycles: BigInt(0),
                  args: { Encoded: [...new Uint8Array(encoded)] },
                },
              ],
            },
          },
        ],
      };

      nav(`/wallet/${unionId}/votings/crud/execute`, { state });
    },
    [methodName, unionId, canisterId, identity, encode],
  );

  const isAllowed = !!methodAccess[methodName]?.length;

  return {
    isAllowed,
    submitting,
    submit,
    createVoting,
  };
};
