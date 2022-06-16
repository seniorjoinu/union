import React, { useCallback, useEffect, useState } from 'react';
import { SubmitButtonProps } from '@union/components';
import { useAuth, useUnion, _SERVICE, unionIdl } from 'services';
import { useNavigate } from 'react-router-dom';
import { Principal } from '@dfinity/principal';
import { buildDecoder, buildEncoder } from '@union/serialize';
import { AnyService, EncDec, Encoder, Decoder } from './hook';
import { AccessConfig } from 'union-ts';

export interface UnionRepeatSubmitProps extends Pick<SubmitButtonProps, 'onClick'> {
  unionId: Principal;
  program: {
    canisterId: Principal;
    methodName: string;
  } & EncDec;
  onExecuted?(payload: any, result: any): void;
}

export interface UnionRepeatSubmitResult {
  isAllowed: boolean;
  submitting: boolean;
  submit(e: React.MouseEvent<HTMLButtonElement>, payloads: any[]): Promise<any[]>;
  // createVoting(payloads: any[]): void;
}

export const useUnionRepeatSubmit = ({
  unionId,
  program,
  onClick = () => {},
  onExecuted = () => {},
}: UnionRepeatSubmitProps): UnionRepeatSubmitResult => {
  const [submitting, setSubmitting] = useState(false);
  const nav = useNavigate();
  const { identity } = useAuth();
  const { canister, getMethodAccess, methodAccess } = useUnion<AnyService>(unionId);

  useEffect(() => {
    if (!identity) {
      return;
    }

    getMethodAccess({
      program: [
        {
          canisterId: program.canisterId,
          methodName: program.methodName,
        },
      ],
      profile: identity.getPrincipal(),
    });
  }, []);

  const submit = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>, payloads: any[]): Promise<any> => {
      setSubmitting(true);
      try {
        onClick(e);

        const { canisterId, methodName, encode, decode } = program;
        const encoder = buildEncoder(unionIdl) as Encoder;
        console.log(`\x1b[33mexecute repeat`, { program, payloads });

        let accessConfig: AccessConfig | null = null; // FIXME bad practice
        const datas = payloads.map((payload, i) => {
          accessConfig = methodAccess[methodName][0];

          if (!accessConfig) {
            throw new Error('No access');
          }

          const encoded = encode ? encode(payload) : encoder[methodName](...(payload || []));

          return { canisterId, methodName, Encoded: [...new Uint8Array(encoded)], decode };
        });

        if (!accessConfig) {
          throw new Error('No access');
        }

        const { result } = await canister.execute({
          access_config_id: (accessConfig as AccessConfig).id[0]!,
          program: {
            RemoteCallSequence: datas.map((d) => ({
              endpoint: { canister_id: d.canisterId, method_name: d.methodName },
              cycles: BigInt(0),
              args: { Encoded: d.Encoded },
            })),
          },
        });

        if (!('RemoteCallSequence' in result)) {
          throw new Error('No RemoteCallSequence result');
        }

        const responses = result.RemoteCallSequence;

        const decoder = buildDecoder(unionIdl) as Decoder;

        const decodedResults = await Promise.all(
          responses.map(async (response, i) => {
            if ('Err' in response) {
              throw new Error(`${response.Err[0]}: ${response.Err[1]}`);
            }

            const { buffer } = new Uint8Array(response.Ok);

            const decode = datas[i] ? datas[i].decode : null;
            const methodName = datas[i] ? datas[i].methodName : '';

            const decoded = decode ? decode(buffer) : (await decoder[methodName](buffer))[0];

            return { decoded };
          }),
        );

        onExecuted(payloads, decodedResults);
        setSubmitting(false);

        return decodedResults;
      } catch (e) {
        setSubmitting(false);
        throw e;
      }
    },
    [program, methodAccess, onClick, onExecuted, setSubmitting],
  );

  // const createVoting = useCallback(
  //   (payloads: any[]) => {
  //     const state = {
  //       voting: null,
  //       choices: [], // TODO
  //     };

  //     nav(`/wallet/${unionId}/execute`, { state });
  //   },
  //   [program, unionId],
  // );

  const isAllowed = !!methodAccess[program.methodName]?.length;

  return {
    isAllowed,
    submitting,
    submit,
    // createVoting,
  };
};
