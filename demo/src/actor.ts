import {
  Actor,
  ActorConfig,
  // ProxyAgent,
  // ProxyMessage,
  // ProxyMessageKind,
  // ProxyStubAgent,
  // ProxyMessageCallResponse,
  // requestIdOf,
} from '@dfinity/agent';
import { IDL } from '@dfinity/candid';
import { _SERVICE } from './backend';
// import { backendSerializer, _SERVICE } from './backend';
// import { unionWalletClient } from './union';
// import { Principal } from '@dfinity/principal';

export const createActor = <T>(idl: IDL.InterfaceFactory, configuration: ActorConfig): T => {
  return Actor.createActor<T>(idl, configuration);
  // const { agent } = configuration;
  // if (!agent) {
  //   throw 'Agent dows not exists';
  // }

  // const backend = (msg: ProxyMessage) => {
  //   switch (msg.type) {
  //     case ProxyMessageKind.Call: {
  //       console.log('PROXY', msg);
  //       console.log('PROXY_DECODED', Cbor.decode(msg.args[1].arg));
  //       const response: ProxyMessageCallResponse = {
  //         ...msg,
  //         type: ProxyMessageKind.CallResponse,
  //         response: {
  //           requestId: requestIdOf({}),
  //           response: {
  //             ok: true,
  //             status: 200,
  //             statusText: 'Proxied to union-wallet',
  //           },
  //         },
  //       };
  //       proxy.onmessage(response);
  //       break;
  //     }
  //     default: {
  //       stub.onmessage(msg);
  //     }
  //   }
  // };
  // const proxy = new ProxyAgent(backend);
  // const stub = new ProxyStubAgent((msg) => proxy.onmessage(msg), agent);
  // proxy.fetchRootKey();

  // return Actor.createActor<T>(idl, { ...configuration, agent: proxy });

  // return Actor.createActor<T>(idl, {
  //   ...configuration,
  //   callTransform: (methodName: string, args: any[], config) => {
  //     if (unionWalletClient.isAuthorized()) {
  //       const canisterId = Principal.from(config.canisterId);
  //       const candidArgs = backendSerializer[methodName as keyof _SERVICE](...args);

  //       unionWalletClient.execute(
  //         {
  //           title: 'Demo canister operation',
  //           description: `Call "${methodName}" in "${canisterId.toString()}" canister`,
  //           authorization_delay_nano: BigInt(60 * 60 * 10 ** 9), // 1 hour
  //           program: {
  //             RemoteCallSequence: [
  //               {
  //                 endpoint: {
  //                   canister_id: Principal.from(config.canisterId),
  //                   method_name: methodName,
  //                 },
  //                 args: { CandidString: candidArgs },
  //                 cycles: BigInt(10 * 6),
  //               },
  //             ],
  //           },
  //         },
  //         { after: 'close' },
  //       );
  //       throw 'Used union wallet executor';
  //     }

  //     if (configuration.callTransform) {
  //       return configuration.callTransform(methodName, args, config);
  //     }
  //     return config;
  //   },
  // });
};
