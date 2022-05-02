import { Actor, ActorConfig } from '@dfinity/agent';
import { IDL } from '@dfinity/candid';
import { _SERVICE } from './backend';
// import { backendSerializer, _SERVICE } from './backend';
// import { unionWalletClient } from './union';
// import { Principal } from '@dfinity/principal';

export const createActor = <T>(idl: IDL.InterfaceFactory, configuration: ActorConfig): T => {
  return Actor.createActor<T>(idl, configuration);
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
