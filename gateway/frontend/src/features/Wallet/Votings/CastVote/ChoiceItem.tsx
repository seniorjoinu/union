import { Principal } from '@dfinity/principal';
import { Accordeon, Button as B, Chips, Column, Row, Spinner, Text } from '@union/components';
import React, { useEffect, useMemo } from 'react';
import { get } from 'react-hook-form';
import styled from 'styled-components';
import { Choice, GroupId, RemoteCallArgs, RoundResult, Shares, Voting } from 'union-ts';
import { NavLink, useNavigate } from 'react-router-dom';
import { useUnion } from 'services';
import { useRender, ViewerSettings } from '../../../IDLRenderer';
import { GroupInfo } from '../../Groups';
import {
  UnionTooltipButtonComponent as UTB,
  useUnionSubmit,
} from '../../../../components/UnionSubmit';
import { CandidEncodedArgs } from '../../IDLFields/CandidEncodedArgs';

const UnionTooltipButtonComponent = styled(UTB)``;
const Button = styled(B)``;
const Controls = styled(Row)`
  justify-content: space-between;

  & > ${Text} {
    flex-grow: 1;
    margin-right: 16px;
  }
  & > ${Button}, & > ${UnionTooltipButtonComponent} {
    align-self: flex-start;
  }
`;
const RowChips = styled(Row)`
  &:empty {
    display: none;
  }
`;
const Container = styled(Column)`
  padding-bottom: 8px;
`;

export interface ChoiceItemProps {
  className?: string;
  style?: React.CSSProperties;
  unionId: Principal;
  choice: Choice | bigint;
  vote?: [bigint, bigint] | undefined;
  results?: [GroupId, Shares][];
  voting: Voting;
  children?: React.ReactNode;
}

export const ChoiceItem = styled(
  ({
    unionId,
    choice: propChoice,
    children,
    vote,
    results = [],
    voting,
    ...p
  }: ChoiceItemProps) => {
    const nav = useNavigate();
    const { canister, data } = useUnion(unionId);
    const deleteChoiceUnionButtonProps = useUnionSubmit({
      unionId,
      canisterId: unionId,
      methodName: 'delete_voting_choice',
      onExecuted: (p) => nav('', { replace: true }),
    });
    const { View } = useRender<Choice>({
      canisterId: unionId,
      type: 'Choice',
    });

    useEffect(() => {
      if (typeof propChoice !== 'bigint') {
        return;
      }
      canister.get_voting_choice({
        choice_id: propChoice,
        voting_id: { Common: voting.id[0]! },
        query_delegation_proof_opt: [],
      });
    }, []);

    const choice = useMemo(() => {
      if (typeof propChoice !== 'bigint') {
        return propChoice;
      }
      return data.get_voting_choice?.choice;
    }, [propChoice, data.get_voting_choice?.choice]);

    const win = useMemo(
      () => voting.winners.find((w) => w.choices.find((id) => id == choice?.id[0])),
      [choice, voting],
    );
    const readonlyChoices = useMemo(() => [voting.approval_choice[0], voting.rejection_choice[0]], [
      voting,
    ]);

    const settings: ViewerSettings<Choice> = useMemo(() => {
      if (!choice) {
        return {};
      }
      return {
        fields: {
          id: { hide: true },
          voting_id: { hide: true },
          voting_power_by_group: { hide: true },
          name: {
            order: 1,
            adornment: {
              kind: 'replace',
              render: (ctx) => (
                <>
                  <RowChips>
                    {vote && (
                      <Chips variant='caption'>Chosen by you with {String(vote[1])} shares</Chips>
                    )}
                    {win && (
                      <Chips color='green' variant='caption'>
                        Winner of round {win.round}
                      </Chips>
                    )}
                  </RowChips>
                  <Controls>
                    <Text variant='p2' weight='medium'>
                      {ctx.value.name}
                    </Text>
                    {'Round' in voting.status &&
                      voting.status.Round == 0 &&
                      !readonlyChoices.includes(choice.id[0]) && (
                        <>
                          <Button
                            forwardedAs={NavLink}
                            to={`../votings/crud/choice/edit/${String(voting.id[0])}/${String(
                              choice.id[0],
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
                              { choice_id: choice.id[0], voting_id: { Common: voting.id[0] } },
                            ]}
                          >
                            Delete
                          </UnionTooltipButtonComponent>
                        </>
                      )}
                  </Controls>
                </>
              ),
            },
          },
          description: {
            order: 2,
            multiline: true,
            adornment: {
              kind: 'replace',
              render: (ctx) => (
                <Text variant='p3' color='grey'>
                  {ctx.value.description}
                </Text>
              ),
            },
          },
          program: {
            order: 3,
            label: '',
            adornment: {
              kind: 'replace',
              render: (ctx, path, name, origin) =>
                ('Empty' in ctx.value.program ? null : (
                  <Accordeon
                    title={
                      <Text variant='p3' weight='medium'>
                        Program
                      </Text>
                    }
                    border='none'
                  >
                    {origin}
                  </Accordeon>
                )),
            },
          },
          'program.RemoteCallSequence.-1.args': {
            adornment: {
              kind: 'replace',
              render: (ctx, path, name) => {
                const args = get(ctx.value, path) as RemoteCallArgs;
                const canisterId = get(
                  ctx.value,
                  path.replace('.args', '.endpoint.canister_id'),
                ) as Principal;
                const methodName = get(
                  ctx.value,
                  path.replace('.args', '.endpoint.method_name'),
                ) as string;

                return (
                  <CandidEncodedArgs
                    args={args}
                    canisterId={canisterId}
                    methodName={methodName}
                    unionId={unionId}
                  />
                );
              },
            },
          },
        },
      };
    }, [unionId, vote, win, deleteChoiceUnionButtonProps, voting, choice]);

    if (!choice) {
      return (
        <Container {...p}>
          <Spinner />
        </Container>
      );
    }

    return (
      <Container {...p}>
        <View value={choice} settings={settings} />
        {!!results.length && (
          <Accordeon
            title={
              <Text variant='p3' weight='medium'>
                Votes stats
              </Text>
            }
            border='none'
          >
            <Column>
              {results.map((power) => {
                const twp = voting.total_voting_power_by_group.find((twp) => twp[0] == power[0]);

                return (
                  <GroupInfo
                    key={String(power[0])}
                    variant='caption'
                    groupId={power[0]}
                    shares={power[1]}
                    chips={twp ? [`of ${String(twp[1])}`] : []}
                    mode='short'
                    to={`../groups/${String(power[0])}`}
                  />
                );
              })}
            </Column>
          </Accordeon>
        )}
        {children}
      </Container>
    );
  },
)``;
