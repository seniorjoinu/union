import { Permission, CreateVotingConfigRequest } from 'union-ts';

export interface VotingConfigFormData {
  name: string;
  description: string;
  permissions: Permission[];
}
