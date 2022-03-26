import { ExecuteRequest, RemoteCallPayload, RemoteCallEndpoint } from 'wallet-ts';

export interface ExecutorContextData {
  canisterId: string;
}

export interface Program extends Omit<RemoteCallPayload, 'endpoint' | 'cycles'> {
  endpoint: Omit<RemoteCallEndpoint, 'canister_id'> & {
    // eslint-disable-next-line camelcase
    canister_id: string;
  };
  cycles: string;
}

export type ExecutorFormData = Omit<ExecuteRequest, 'authorization_delay_nano' | 'program'> & {
  program: Program[];
};

export type ExternalExecutorFormData = Partial<ExecutorFormData>;

export const getEmptyProgram = (): Program => ({
  endpoint: { canister_id: '', method_name: '' },
  args_candid: [''],
  cycles: '',
});
