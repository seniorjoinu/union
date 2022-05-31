import { CreateVotingChoiceRequest, CreateVotingRequest } from 'union-ts';

export type VotingData = CreateVotingRequest;
export type ChoiceData = Omit<CreateVotingChoiceRequest, 'voting_id'>;
export interface MessageData {
  voting: CreateVotingRequest;
  choices?: ChoiceData[];
}
