import { Actor, ActorConfig } from '@dfinity/agent';
import { IDL } from '@dfinity/candid';
import { _SERVICE } from './backend';

export const createActor = <T>(idl: IDL.InterfaceFactory, configuration: ActorConfig): T => {
  return Actor.createActor<T>(idl, configuration);
};
