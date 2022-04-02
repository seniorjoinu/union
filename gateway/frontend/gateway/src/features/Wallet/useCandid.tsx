import React, { useEffect, useState } from 'react';
import { IDL } from '@dfinity/candid';
import { Actor, ActorSubclass } from '@dfinity/agent';
import { useAuth } from 'services';
import { checkPrincipal } from 'toolkit';

export interface UseCandidProps {
  canisterId: string;
  getCandidMethodName?: string;
}

export const useCandid = ({
  canisterId,
  getCandidMethodName = 'export_candid',
}: UseCandidProps) => {
  const [did, setDid] = useState<ParseResult>({ methods: [] });
  const { authClient } = useAuth();

  useEffect(() => {
    const check = checkPrincipal(canisterId);

    if (!check) {
      return;
    }

    const common_interface: IDL.InterfaceFactory = ({ IDL }) =>
      IDL.Service({
        [getCandidMethodName]: IDL.Func([], [IDL.Text], ['query']),
      });
    const actor: ActorSubclass = Actor.createActor(common_interface, {
      agent: authClient.agent,
      canisterId,
    });

    actor[getCandidMethodName]().then(parse).then(setDid);
  }, []);

  return { did };
};

export interface ParseResult {
  methods: string[];
}

const parse = (did: any): ParseResult => {
  const result: ParseResult = { methods: [] };

  if (typeof did !== 'string') {
    return result;
  }

  const serviceStr = did
    .replace(/[\n\t ]/g, '')
    .replace(/'/g, '"')
    .match(/service\:\(|\)\->{(.*?)\}/g);

  if (!serviceStr || !serviceStr[1]) {
    return result;
  }

  const serviceContent = serviceStr[1].match(/(?<=\{)\s*[^{]*?(?=[\}])/g);

  if (!serviceContent || !serviceContent[0]) {
    return result;
  }

  const methodNames = serviceContent[0].match(/"(.*?)"/g);

  result.methods = (methodNames || []).map((value) => value.replace(/"/g, ''));

  return result;
};
