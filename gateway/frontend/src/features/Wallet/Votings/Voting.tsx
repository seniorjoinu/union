import { Principal } from '@dfinity/principal';
import { Accordeon, Button as B, Chips, Field, PageWrapper, Row, Text } from '@union/components';
import moment from 'moment';
import React, { useEffect, useMemo } from 'react';
import { get } from 'react-hook-form';
import styled from 'styled-components';
import { Voting } from 'union-ts';
import { useUnion } from 'services';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { ViewerSettings, useRender } from '../../IDLRenderer';
import { GroupInfo } from '../Groups';
import { ProfileInfo } from '../Profile';
import { VotingConfigInfo } from '../VotingConfigs';
import { UnionTooltipButtonComponent, useUnionSubmit } from '../../../components/UnionSubmit';
import { ChoiceInfo } from './ChoiceInfo';
import { CastVote } from './CastVote';
import { VotingControls as VC } from './VotingControls';
import { StatusChips } from './atoms';

const Button = styled(B)`
  align-self: flex-start;
`;
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
  const deleteChoiceUnionButtonProps = useUnionSubmit({
    unionId,
    canisterId: unionId,
    methodName: 'delete_voting_choice',
    onExecuted: (p) => nav('', { replace: true }),
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
        description: { hide: true, order: 9 },
        status: { order: 11 },
        proposer: {
          order: 12,
          adornment: {
            kind: 'replace',
            render: (ctx, path, name) => (
              <Field title={name} weight={{ title: 'medium' }} variant={{ title: 'p3' }}>
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
              <Field
                title={name}
                weight={{ title: 'medium' }}
                variant={{ title: 'p3', value: 'p3' }}
                align='row'
              >
                {moment(Number(ctx.value.created_at) / 10 ** 6).format('DD-MM-YY HH:mm:SS')}
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
              <Field title={name} weight={{ title: 'medium' }} variant={{ title: 'p3' }}>
                <VotingConfigInfo
                  votingConfigId={get(ctx.value, path)}
                  to={`../voting-configs/${get(ctx.value, path)}`}
                />
              </Field>
            ),
          },
        },
        approval_choice: {
          order: 18,
        },
        rejection_choice: {
          order: 19,
        },
        choices: {
          order: 20,
          adornment: {
            kind: 'end',
            render: (ctx, path, name) =>
              ('Round' in ctx.value.status && ctx.value.status.Round == 0 ? (
                <Button
                  forwardedAs={NavLink}
                  to={`../votings/crud/choice/create/${String(ctx.value.id[0])}`}
                  variant='caption'
                >
                  Add choice
                </Button>
              ) : (
                <></>
              )),
          },
        },
        total_voting_power_by_group: {
          order: 21,
        },
        winners: {
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
        'approval_choice.0': {
          adornment: {
            kind: 'replace',
            render: (ctx, path, name) =>
              (ctx.value.approval_choice[0] ? (
                <ChoiceInfo
                  unionId={unionId}
                  choiceId={ctx.value.approval_choice[0]}
                  votingId={ctx.value.id[0]!}
                />
              ) : null),
          },
        },
        'rejection_choice.0': {
          adornment: {
            kind: 'replace',
            render: (ctx, path, name) =>
              (ctx.value.rejection_choice[0] ? (
                <ChoiceInfo
                  unionId={unionId}
                  choiceId={ctx.value.rejection_choice[0]}
                  votingId={ctx.value.id[0]!}
                />
              ) : null),
          },
        },
        'choices.-1': {
          adornment: {
            kind: 'replace',
            render: (ctx, path, name) => (
              <ChoiceInfo
                unionId={unionId}
                choiceId={get(ctx.value, path)}
                votingId={ctx.value.id[0]!}
              >
                {'Round' in ctx.value.status && ctx.value.status.Round == 0 && (
                  <>
                    <Button
                      forwardedAs={NavLink}
                      to={`../votings/crud/choice/edit/${String(ctx.value.id[0])}/${get(
                        ctx.value,
                        path,
                      )}`}
                      variant='caption'
                    >
                      Edit
                    </Button>
                    <UnionTooltipButtonComponent
                      {...deleteChoiceUnionButtonProps}
                      variant='caption'
                      color='red'
                      buttonContent='Delete'
                      submitVotingVerbose='Delete with voting'
                      getPayload={() => [
                        { choice_id: get(ctx.value, path), voting_id: { Common: ctx.value.id[0] } },
                      ]}
                    >
                      Delete
                    </UnionTooltipButtonComponent>
                  </>
                )}
              </ChoiceInfo>
            ),
          },
        },
        'total_voting_power_by_group.-1': {
          adornment: {
            kind: 'replace',
            render: (ctx, path) => {
              const power = get(ctx.value, path);

              return (
                <GroupInfo
                  groupId={power[0]}
                  shares={power[1]}
                  mode='long'
                  to={`../groups/${String(power[0])}`}
                />
              );
            },
          },
        },
        'winners.-1.choices.-1': {
          adornment: {
            kind: 'replace',
            render: (ctx, path, name) => (
              <ChoiceInfo
                unionId={unionId}
                choiceId={get(ctx.value, path)}
                votingId={ctx.value.id[0]!}
              />
            ),
          },
        },
        'losers.-1.choices.-1': {
          adornment: {
            kind: 'replace',
            render: (ctx, path, name) => (
              <ChoiceInfo
                unionId={unionId}
                choiceId={get(ctx.value, path)}
                votingId={ctx.value.id[0]!}
              />
            ),
          },
        },
      },
    }),
    [voting, unionId, deleteChoiceUnionButtonProps],
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
      </Chipses>
      <Field>{voting.description}</Field>
      <Accordeon title='Details'>
        <View style={{ padding: '8px 0' }} value={voting} settings={settings} />
      </Accordeon>
      <CastVote unionId={unionId} voting={voting} onVoted={() => nav('', { replace: true })} />
      {/* <Field title='Nested votings' weight={{ title: 'medium' }} variant={{ title: 'p3' }}>
        <NestedVotingConfigs parentVotingConfig={votingConfig.id[0]} />
      </Field> */}
    </Container>
  );
})``;
