import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Principal } from '@dfinity/principal';
import {
  Column,
  Spinner,
  SubmitButton,
  FlatSelect,
  Text,
  AdvancedSelect,
  AdvancedOption,
  TextField,
} from '@union/components';
import { useUnion } from 'services';
import styled from 'styled-components';
import { Choice, ChoiceId, Group, Shares, SharesInfo, Voting, VotingConfig } from 'union-ts';
import { Controller, useForm } from 'react-hook-form';
import { normalizeValues, useRender, ViewerSettings } from '../../../IDLRenderer';
import { getGroupsFromThresholds } from './utils';

const Button = styled(SubmitButton)``;
const ShareBlock = styled(Column)`
  padding: 8px;
`;
const Container = styled(Column)`
  & > ${Spinner} {
    align-self: center;
  }
  & > ${Button} {
    align-self: flex-start;
    margin-left: 8px;
  }
`;

export interface Round0Props {
  className?: string;
  style?: React.CSSProperties;
  unionId: Principal;
  votes: [ChoiceId, Shares][];
  voting: Voting;
  votingConfig: VotingConfig;
  onVoted(vote: [ChoiceId, Shares][]): void;
}

type Info = { group: Group; group_id: bigint; shares_info: SharesInfo };
type FormData = { choice: Choice; info: Info };

export const Round0 = styled(
  ({ unionId, onVoted, voting, votingConfig, votes, ...p }: Round0Props) => {
    const {
      control,
      setValue,
      resetField,
      getValues,
      formState: { isValid },
    } = useForm<FormData>({
      mode: 'all',
    });
    const [shareInfos, setShareInfos] = useState<Info[] | null>(null);
    const [choices, setChoices] = useState<Choice[] | null>(null);
    const { canister } = useUnion(unionId);
    const { View } = useRender<Choice>({
      canisterId: unionId,
      type: 'Choice',
    });

    const ids = useMemo(
      () =>
        [voting.approval_choice[0], voting.rejection_choice[0]].filter(
          (id): id is bigint => typeof id !== 'undefined',
        ),
      [],
    );

    useEffect(() => {
      Promise.all(
        ids.map(async (choice_id) => {
          const { choice } = await canister.get_voting_choice({
            choice_id,
            voting_id: { Common: voting.id[0]! },
            query_delegation_proof_opt: [],
          });

          return choice;
        }),
      ).then(setChoices);
    }, []);

    const groups = useMemo(() => {
      const res: Record<number, bigint[]> = {};

      if (typeof voting.approval_choice[0] !== 'undefined') {
        res[Number(voting.approval_choice[0])] = getGroupsFromThresholds(votingConfig.approval);
      }
      if (typeof voting.rejection_choice[0] !== 'undefined') {
        res[Number(voting.rejection_choice[0])] = getGroupsFromThresholds(votingConfig.rejection);
      }

      return res;
    }, []);

    useEffect(() => {
      const groupsByIds = ids.map((id) => groups[Number(id)] || []).flat();
      const allGroups = new Set(groupsByIds);

      Promise.all(
        Array.from(allGroups).map(async (group_id) => {
          const { group } = await canister.get_group({ group_id, query_delegation_proof_opt: [] });
          const { shares_info } = await canister.get_my_shares_info_at({
            group_id,
            at: voting.created_at,
          });

          return { group, group_id, shares_info: shares_info[0] };
        }),
      )
        .then((shareInfos) => shareInfos.filter((s): s is Info => !!s.shares_info))
        .then(setShareInfos);
    }, [groups, setShareInfos, ids]);

    const settings: ViewerSettings<Choice> = useMemo(
      () => ({
        fields: {
          id: { hide: true },
          voting_id: { hide: true },
          voting_power_by_group: { hide: true },
          name: {
            order: 1,
            adornment: {
              kind: 'replace',
              render: (ctx) => (
                <Text variant='p2' weight='medium'>
                  {ctx.value.name}
                </Text>
              ),
            },
          },
          description: {
            order: 2,
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
            adornment: {
              kind: 'replace',
              render: (ctx, path, name, origin) =>
                ('Empty' in ctx.value.program ? null : <>{origin}</>),
            },
          },
        },
      }),
      [voting, unionId],
    );

    const submit = useCallback(async () => {
      const values: FormData = normalizeValues(getValues());

      if (values.choice.id[0] == voting.approval_choice[0]) {
        await canister.cast_my_vote({
          id: voting.id[0]!,
          vote: {
            Approval: {
              shares_info: values.info.shares_info,
            },
          },
        });
      } else if (values.choice.id[0] == voting.rejection_choice[0]) {
        await canister.cast_my_vote({
          id: voting.id[0]!,
          vote: {
            Rejection: {
              shares_info: values.info.shares_info,
            },
          },
        });
      } else {
        await canister.cast_my_vote({
          id: voting.id[0]!,
          vote: {
            Common: {
              shares_info: values.info.shares_info,
              vote: [[values.choice.id[0]!, '1']],
            },
          },
        });
      }
      const { vote } = await canister.get_my_vote({
        voting_id: voting.id[0]!,
        group_id: values.info.group_id,
      });

      onVoted(vote);
    }, [canister, voting, getValues, onVoted]);

    if (!shareInfos || !choices) {
      return (
        <Container {...p}>
          <Spinner size={15} />
        </Container>
      );
    }

    return (
      <Container {...p}>
        <Controller
          name='choice'
          control={control}
          rules={{ required: 'This field is required' }}
          render={({ field, fieldState: { error } }) => (
            <FlatSelect
              multiple={false}
              onChange={(indexes) => {
                const choice = indexes.length ? choices[indexes[0]] : null;

                field.onChange(choice);
                resetField('info');

                if (!choice) {
                  return;
                }

                const groupIds = groups[Number(choice.id[0])] || [];
                const choiceShareInfos = (shareInfos || []).find((s) =>
                  groupIds.includes(s.group_id),
                );

                if (groupIds.length == 1 && choiceShareInfos) {
                  setValue('info', choiceShareInfos);
                }
              }}
              value={[choices.findIndex((c) => c.id[0] == field.value?.id[0])]}
            >
              {choices.map((choice) => (
                <Column key={String(choice.id[0])}>
                  <View value={choice} settings={settings} />
                  {votes.find(([choiceId, shares]) => choice.id[0] == choiceId && !!shares) && (
                    <Text color='red'>Chosen</Text>
                  )}
                </Column>
              ))}
            </FlatSelect>
          )}
        />
        <Controller
          name='info'
          control={control}
          rules={{ required: 'This field is required' }}
          render={({ field, fieldState: { error }, formState }) => {
            const { choice } = getValues();

            if (!choice) {
              return <></>;
            }

            const groupIds = groups[Number(choice.id[0])] || [];
            const choiceShareInfos = (shareInfos || []).filter((s) =>
              groupIds.includes(s.group_id),
            );

            if (!choiceShareInfos.length || choiceShareInfos.length == 1) {
              return <></>;
            }

            return (
              <ShareBlock>
                <AdvancedSelect
                  label='Voting on behalf of the group'
                  onChange={(_, info: Info) => field.onChange(info)}
                  value={field.value?.group.name ? [field.value?.group.name] : []}
                  multiselect={false}
                  helperText={error?.message}
                >
                  {choiceShareInfos.map((info) => (
                    <AdvancedOption
                      key={Number(info.group_id)}
                      value={info.group.name}
                      obj={info}
                    />
                  ))}
                </AdvancedSelect>
                {/* <Controller
                name='info.shares_info.balance'
                control={control}
                rules={{ required: 'This field is required' }}
                render={(p) => (
                  <TextField
                    label='With shares'
                    value={String(p.field.value)}
                    onChange={(e) => p.field.onChange(BigInt(e.target.value))}
                    type='number'
                  />
                )}
              /> */}
              </ShareBlock>
            );
          }}
        />
        <Button disabled={!isValid} onClick={submit}>
          Cast vote
        </Button>
      </Container>
    );
  },
)``;
