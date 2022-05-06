import React, { useEffect, useState } from 'react';
import { Principal } from '@dfinity/principal';
import { IDL } from '@dfinity/candid';
import { Actor, ActorSubclass } from '@dfinity/agent';
import { useAuth } from 'services';
import { checkPrincipal } from 'toolkit';

export interface UseCandidProps {
  canisterId: Principal;
  getCandidMethodName?: string;
}

export const useCandid = ({
  canisterId,
  getCandidMethodName = 'export_candid',
}: UseCandidProps) => {
  const [did, setDid] = useState<ParseResult>({ methods: [] });
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

  console.log(0, { did });

  const serviceStr = did
    .replace(/[\n\t ]/g, '')
    .replace(/'/g, '"')
    .match(/service\:(|\((.*?)\)\->){(.*?)\}/g); // get service:{} braces content

  if (!serviceStr || !serviceStr.length) {
    return result;
  }

  const serviceContent = serviceStr.pop()!.match(/(?<=\{)\s*[^{]*?(?=[\}])/g); // get method names as is (maybe with quotes)

  if (!serviceContent || !serviceContent[0]) {
    return result;
  }

  const methodNames = serviceContent[0].match(/(\w+)(?=("|)\:\()/g); // get method content inside quotes - will be methodname

  result.methods = [...(methodNames || [])];

  return result;
};

// @ts-expect-error
window.parse = parse;
