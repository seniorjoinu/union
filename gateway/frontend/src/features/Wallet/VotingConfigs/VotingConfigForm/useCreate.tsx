import { useCallback } from 'react';
import { CreateVotingConfigRequest } from 'union-ts';
import { VotingConfigFormData } from './types';

export interface UseCreateProps {
  getValues(): VotingConfigFormData;
}

export const useCreate = ({ getValues }: UseCreateProps) => {
  const getCreatePayload = useCallback((): CreateVotingConfigRequest => {
    const { permissions, ...values } = getValues();

    const result: CreateVotingConfigRequest = {
      ...values,
      permissions: permissions.map((p) => p.id[0]!),
      // TODO
      win: { QuantityOf: { quantity: BigInt(0), target: { Group: BigInt(0) } } },
      winners_count: [],
      rejection: { QuantityOf: { quantity: BigInt(0), target: { Group: BigInt(0) } } },
      next_round: { QuantityOf: { quantity: BigInt(0), target: { Group: BigInt(0) } } },
      choices_count: [],
      approval: { QuantityOf: { quantity: BigInt(0), target: { Group: BigInt(0) } } },
      quorum: { QuantityOf: { quantity: BigInt(0), target: { Group: BigInt(0) } } },
      round: { round_delay: BigInt(0), round_duration: BigInt(0) },
    };

    return result;
  }, [getValues]);

  return {
    getCreatePayload,
  };
};
