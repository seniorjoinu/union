import { Principal } from '@dfinity/principal';
import { ExecuteRequest, RemoteCallPayload, RemoteCallEndpoint } from 'wallet-ts';

export interface ExecutorContextData {
  canisterId: Principal;
}

export interface Program extends Omit<RemoteCallPayload, 'endpoint' | 'cycles' | 'args'> {
  endpoint: Omit<RemoteCallEndpoint, 'canister_id'> & {
    // eslint-disable-next-line camelcase
    canister_id: string;
  };
  cycles: string;
  args_candid: string[];
  args_encoded?: number[];
}

export type ExecutorFormData = Omit<ExecuteRequest, 'authorization_delay_nano' | 'program'> & {
  authorization_delay_nano: number;
  program: Program[];
};

export type ExtendedProgram = { Empty: null } | { RemoteCallSequence: Array<RemoteCallPayload> };

export type ExecutorSerializedFormData = Omit<
  ExecuteRequest,
  'authorization_delay_nano' | 'program'
> & {
  authorization_delay_nano: number;
  program: ExtendedProgram;
};

export type ExternalExecutorFormData = Partial<ExecutorSerializedFormData>;

export const getEmptyProgram = (): Program => ({
  endpoint: { canister_id: '', method_name: '' },
  args_candid: [''],
  cycles: '',
});
