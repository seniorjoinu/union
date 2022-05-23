import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageWrapper } from '@union/components';
import styled from 'styled-components';
import { UpdateVotingConfigRequest } from 'union-ts';
import { useUnion } from 'services';
import { UnionSubmitButton } from '../../../../components/UnionSubmit';
import { useRender } from '../../../IDLRenderer';
import { useCurrentUnion } from '../../context';

const Container = styled(PageWrapper)``;

export interface UpdateVotingConfigFormProps {
  className?: string;
  style?: React.CSSProperties;
}

export const UpdateVotingConfigForm = styled(({ ...p }: UpdateVotingConfigFormProps) => {
  const { principal } = useCurrentUnion();
  const nav = useNavigate();
  const { votingConfigId } = useParams();
  const { canister, fetching, data } = useUnion(principal);

  useEffect(() => {
    if (!votingConfigId) {
      return;
    }

    canister.get_voting_config({ id: BigInt(votingConfigId), query_delegation_proof_opt: [] });
  }, [votingConfigId]);

  const defaultValue: UpdateVotingConfigRequest | null = useMemo(() => {
    const votingConfig = data.get_voting_config?.voting_config;

    if (!votingConfigId || !votingConfig) {
      return null;
    }

    return {
      id: BigInt(votingConfigId),
      description_opt: [votingConfig.description],
      next_round_opt: [votingConfig.next_round],
      name_opt: [votingConfig.name],
      quorum_opt: [votingConfig.quorum],
      approval_opt: [votingConfig.approval],
      round_opt: [votingConfig.round],
      choices_count_opt: [votingConfig.choices_count],
      winners_count_opt: [votingConfig.winners_count],
      rejection_opt: [votingConfig.rejection],
      win_opt: [votingConfig.win],
      permissions_opt: [votingConfig.permissions],
    };
  }, [votingConfigId, data.get_voting_config?.voting_config]);

  const { Form } = useRender<UpdateVotingConfigRequest>({
    canisterId: principal,
    type: 'UpdateVotingConfigRequest',
  });

  if (!votingConfigId) {
    return <span>votingConfigId is empty</span>;
  }

  if (fetching.get_voting_config) {
    return <span>fetching</span>;
  }

  if (!data.get_voting_config?.voting_config || !defaultValue) {
    return <span>Voting config does not found</span>;
  }

  return (
    <Container title='Update voting config' withBack {...p}>
      <Form defaultValue={defaultValue}>
        {(ctx) => (
          <UnionSubmitButton
            unionId={principal}
            canisterId={principal}
            methodName='update_voting_config'
            getPayload={() => [ctx.getValues() as UpdateVotingConfigRequest]}
            onExecuted={() => nav(-1)}
            disabled={!ctx.formState.isValid}
          >
            Update voting config
          </UnionSubmitButton>
        )}
      </Form>
    </Container>
  );
})``;
