import { Principal } from '@dfinity/principal';
import { Accordeon, Button as B, Chips, Field, PageWrapper, Row, Text } from '@union/components';
import moment from 'moment';
import React, { useEffect, useMemo } from 'react';
import { get } from 'react-hook-form';
import styled from 'styled-components';
import { Voting } from 'union-ts';
import { useUnion } from 'services';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { ViewerSettings, useRender, defaultFieldProps } from '../../IDLRenderer';
import { ProfileInfo } from '../Profile';
import { VotingConfigInfo } from '../VotingConfigs';
import { useUnionSubmit } from '../../../components/UnionSubmit';
import { CastVote } from './CastVote';
import { VotingControls as VC } from './VotingControls';
import { StatusChips } from './atoms';
import { WinnersChoicesInfo } from './WinnersChoicesInfo';
import { Timer } from './Timer';

const Chipses = styled(Row)`
  margin-bottom: 16px;
`;
const VotingControls = styled(VC)``;
const Container = styled(PageWrapper)`
  ${VotingControls} {
    align-self: flex-end;
  }

  & > ${Field} {
    margin-bottom: 16px;
  }
  & > ${WinnersChoicesInfo} {
    margin-top: 16px;
  }
  & > ${CastVote} {
    margin-top: 16px;
  }
`;

export interface VotingProps {
  className?: string;
  style?: React.CSSProperties;
  unionId: Principal;
}

export const VotingPage = styled(({ unionId, ...p }: VotingProps) => {
  const { votingId } = useParams();
  const nav = useNavigate();
  const { canister, data, fetching } = useUnion(unionId);
  const { View } = useRender<Voting>({
    canisterId: unionId,
    type: 'Voting',
  });
  const deleteUnionButtonProps = useUnionSubmit({
    unionId,
    canisterId: unionId,
    methodName: 'delete_voting',
    onExecuted: (p) => nav('../votings'),
  });

  const id = BigInt(votingId || -1);

  useEffect(() => {
    canister.get_voting({ id, query_delegation_proof_opt: [] });
  }, []);

  const voting = data.get_voting?.voting;

  const settings: ViewerSettings<Voting> = useMemo(
    () => ({
      fields: {
        name: { hide: true },
        id: { hide: true },
        task_id: { hide: true },
        description: { hide: true, order: 9, multiline: true },
        status: { order: 11 },
        proposer: {
          order: 12,
          adornment: {
            kind: 'replace',
            render: (ctx, path, name) => (
              <Field title={name} {...defaultFieldProps}>
                <ProfileInfo profileId={ctx.value.proposer} />
              </Field>
            ),
          },
        },
        created_at: {
          order: 14,
          adornment: {
            kind: 'replace',
            render: (ctx, path, name) => (
              <Field title={name} {...defaultFieldProps} align='row'>
                {moment(Number(ctx.value.created_at) / 10 ** 6).format("DD MMM'YY HH:mm:SS")}
              </Field>
            ),
          },
        },
        updated_at: {
          hide: true,
        },
        winners_need: { order: 16 },
        voting_config_id: {
          order: 17,
          label: 'Voting config',
          adornment: {
            kind: 'replace',
            render: (ctx, path, name) => (
              <Field title={name} {...defaultFieldProps}>
                <VotingConfigInfo
                  votingConfigId={get(ctx.value, path)}
                  to={`../voting-configs/${get(ctx.value, path)}`}
                />
              </Field>
            ),
          },
        },
        choices: {
          hide: true,
        },
        winners: {
          hide: true,
          order: 22,
        },
        losers: {
          hide: true,
          order: 23,
        },
        'winners.-1.round': {
          order: 1,
        },
        'winners.-1.choices': {
          order: 2,
        },
        'losers.-1.round': {
          order: 1,
        },
        approval_choice: {
          hide: true,
        },
        rejection_choice: {
          hide: true,
        },
        total_voting_power_by_group: {
          hide: true,
        },
      },
    }),
    [voting, unionId],
  );

  if (!votingId) {
    return <span>votingId is empty</span>;
  }

  if (fetching.get_voting) {
    return <span>fetching</span>;
  }

  if (!voting) {
    return <span>Voting does not found</span>;
  }

  return (
    <Container title={voting.name} withBack>
      {'Round' in voting.status && voting.status.Round == 0 && (
        <VotingControls
          voting={voting}
          navPrefix='../votings/'
          deleteUnionButtonProps={deleteUnionButtonProps}
        />
      )}
      <Chipses>
        <StatusChips variant='caption' weight='medium' status={voting.status} />
        {'Round' in voting.status && (
          <Chips variant='caption' weight='medium'>
            <Timer votingConfigId={voting.voting_config_id} createdAt={voting.created_at} />
          </Chips>
        )}
      </Chipses>
      <Field {...defaultFieldProps}>{voting.description}</Field>
      <Accordeon title='Details'>
        <View style={{ padding: '8px 0' }} value={voting} settings={settings} />
      </Accordeon>
      <WinnersChoicesInfo voting={voting} unionId={unionId} variant='h5' />
      <CastVote unionId={unionId} voting={voting} onVoted={() => nav('', { replace: true })} />
      {/* <Field title='Nested votings' {...defaultFieldProps}>
        <NestedVotingConfigs parentVotingConfig={votingConfig.id[0]} />
      </Field> */}
    </Container>
  );
})``;
