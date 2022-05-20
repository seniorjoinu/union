import React, { useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTrigger } from 'toolkit';
import { useUnion } from 'services';
import { UpdateVotingConfigRequest } from 'union-ts';
import { useCurrentUnion } from '../../context';
import { VotingConfigFormData } from './types';

export interface UseEditProps {
  setValue(name: string, value: any): void; // FIXME
  getValues(): VotingConfigFormData;
}

export const useEdit = ({ setValue, getValues }: UseEditProps) => {
  const { votingConfigId } = useParams();
  const { principal } = useCurrentUnion();
  const { canister, fetching, data } = useUnion(principal);

  useEffect(() => {
    if (!votingConfigId) {
      return;
    }

    canister.get_voting_config({ id: BigInt(votingConfigId), query_delegation_proof_opt: [] });
  }, [setValue, votingConfigId]);

  useTrigger(
    ({ voting_config }) => {
      setValue('name', voting_config.name);
      setValue('description', voting_config.description);

      Promise.all(
        voting_config.permissions.map((id) =>
          canister.get_permission({ id, query_delegation_proof_opt: [] }),
        ),
      ).then((permissions) =>
        setValue(
          'permissions',
          permissions.map((p) => p.permission),
        ),
      );

      console.warn('TODO get voting config form');
    },
    data.get_voting_config,
    [data.get_voting_config, setValue, canister],
  );

  const votingConfig = data.get_voting_config?.voting_config;

  const getUpdatePayload = useCallback((): UpdateVotingConfigRequest => {
    if (!votingConfigId || !votingConfig) {
      return {
        id: BigInt(votingConfigId || -1),
        description_opt: [],
        next_round_opt: [],
        name_opt: [],
        quorum_opt: [],
        approval_opt: [],
        round_opt: [],
        choices_count_opt: [],
        winners_count_opt: [],
        rejection_opt: [],
        win_opt: [],
        permissions_opt: [],
      };
    }
    const old = votingConfig;
    const values = getValues();

    const permissionsChanged =
      values.permissions.length !== old.permissions.length ||
      values.permissions.find((p) => !old.permissions.includes(p.id[0]!));

    console.warn('TODO submit voting config form');

    return {
      id: BigInt(votingConfigId),
      name_opt: old.name !== values.name ? [values.name] : [],
      description_opt: old.description !== values.description ? [values.description] : [],
      permissions_opt: permissionsChanged ? [values.permissions.map((p) => p.id[0]!)] : [],
      // TODO
      next_round_opt: [],
      quorum_opt: [],
      approval_opt: [],
      round_opt: [],
      choices_count_opt: [],
      winners_count_opt: [],
      rejection_opt: [],
      win_opt: [],
    };
  }, [getValues, votingConfig]);

  let fallback: JSX.Element | null = null;

  if (!votingConfigId) {
    fallback = <span>VotingConfigId is empty</span>;
  }

  if (fetching.get_voting_config) {
    fallback = <span>fetching</span>;
  }

  if (!votingConfig) {
    fallback = <span>VotingConfig does not found</span>;
  }

  return {
    fallback,
    getUpdatePayload,
  };
};
