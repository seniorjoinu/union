import { CreateVotingChoiceRequest, CreateVotingRequest } from './assets/union-wallet.did';

export type VotingData = Partial<CreateVotingRequest>;
export type ChoiceData = Omit<Partial<CreateVotingChoiceRequest>, 'voting_id'>;
export interface MessageData {
  voting?: VotingData;
  choices?: ChoiceData[];
}

export interface Message {
  origin: string;
  target: string;
  type: string;
  payload: any;
  options: OpenerOptions;
}

export type OpenerOptions = {
  after?: 'close';
};
