import { Actor, ActorConfig } from '@dfinity/agent';
import { unionWalletClient } from './union';
import { IDL } from '@dfinity/candid';
import { Principal } from '@dfinity/principal';
import { backendSerializer, _SERVICE } from './backend';

export const createActor = <T>(idl: IDL.InterfaceFactory, configuration: ActorConfig): T => {
  const actor = Actor.createActor<T>(idl, {
    ...configuration,
    callTransform: (methodName: keyof _SERVICE, args: any[], config) => {
      if (unionWalletClient.isAuthorized()) {
        const canisterId = Principal.from(config.canisterId);
        const candidArgs = backendSerializer[methodName](...args);

        unionWalletClient.execute(
          {
            title: 'Demo canister operation',
            description: `Call "${methodName}" in "${canisterId.toString()}" canister`,
            authorization_delay_nano: BigInt(60 * 60 * 10 ** 9), // 1 hour
            program: {
              RemoteCallSequence: [
                {
                  endpoint: {
                    canister_id: Principal.from(config.canisterId),
                    method_name: methodName,
                  },
                  args: { CandidString: candidArgs },
                  cycles: BigInt(10 * 6),
                },
              ],
            },
          },
          { after: 'close' },
        );
        throw 'Used union wallet executor';
      }

      if (configuration.callTransform) {
        return configuration.callTransform(methodName, args, config);
      }
      return config;
    },
  });

  return actor;
};
