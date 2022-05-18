import React, { useEffect, useMemo, useState } from 'react';
import { Principal } from '@dfinity/principal';
import { IDL } from '@dfinity/candid';
import { Actor, ActorSubclass } from '@dfinity/agent';
import { lexer, Parser, TProg } from '@union/candid-parser';
import { useAuth } from 'services';
import { sort } from 'toolkit';

export interface UseCandidProps {
  canisterId: Principal;
  getCandidMethodName?: string;
}

export const useCandid = ({
  canisterId,
  getCandidMethodName = 'export_candid',
}: UseCandidProps) => {
  const [prog, setProg] = useState<TProg | null>(null);
  const { authClient } = useAuth();

  useEffect(() => {
    const common_interface: IDL.InterfaceFactory = ({ IDL }) =>
      IDL.Service({
        [getCandidMethodName]: IDL.Func([], [IDL.Text], ['query']),
      });
    const actor: ActorSubclass = Actor.createActor(common_interface, {
      agent: authClient.agent,
      canisterId,
    });

    actor[getCandidMethodName]().then(parseCandid).then(setProg);
  }, []);

  const methods = useMemo(
    () =>
      (prog?.getIdlActor()?._fields.map(([name]) => name) || []).sort((a, b) =>
        sort.string({ a, b, asc: true }),
      ),
    [prog],
  );

  return { prog, methods };
};

export const parseCandid = (candid: any): TProg => {
  if (typeof candid !== 'string') {
    throw new Error('Wrong candid');
  }
  const lexerResult = lexer.tokenize(candid);

  Parser.input = lexerResult.tokens;
  const prog = Parser.prog();

  if (Parser.errors.length > 0) {
    for (const i in Parser.errors) {
      console.error(`Parser error #${i}: `, Parser.errors[i]);
    }

    throw new Error('Throwing due to previous errors');
  }

  return prog;
};
