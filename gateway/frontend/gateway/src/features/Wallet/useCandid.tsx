import React, { useEffect, useState } from 'react';
import { useAuth } from 'services';
import { checkPrincipal } from 'toolkit';
import { IDL } from '@dfinity/candid';
import { Actor, ActorSubclass } from '@dfinity/agent';

export interface UseCandidProps {
  canisterId: string;
  getCandidMethodName?: string;
}

export const useCandid = ({
  canisterId,
  getCandidMethodName = '__get_candid_interface_tmp_hack',
}: UseCandidProps) => {
  const { authClient } = useAuth();

  useEffect(() => {
    const check = checkPrincipal(canisterId);

    if (!check) {
      return;
    }

    // authClient.agent.query(canisterId, { methodName: getCandidMethodName, arg: Buffer.from([]) });

    // return didToJs(candid_source);
    const common_interface: IDL.InterfaceFactory = ({ IDL }) =>
      IDL.Service({
        [getCandidMethodName]: IDL.Func([], [IDL.Text], ['query']),
      });
    const actor: ActorSubclass = Actor.createActor(common_interface, {
      agent: authClient.agent,
      canisterId,
    });

    actor.__get_candid_interface_tmp_hack().then(console.warn);

    // authClient
    // .getIdentity()
    // .then(
    //   (identity) =>
    //       authClient.agent.query(
    //         canisterId,
    //         { methodName: getCandidMethodName, arg: Buffer.from([]) },
    //         identity,
    //       ),
    //     // authClient.agent.call(
    //     //   canisterId,
    //     //   {
    //     //     methodName: getCandidMethodName,
    //     //     arg: Buffer.from([]),
    //     //   },
    //     //   identity,
    //     // ),
    //   )
    //   .then(console.warn);
  }, []);
};
