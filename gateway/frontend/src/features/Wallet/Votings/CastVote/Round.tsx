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

const ChoiceItem = styled(Column)`
  padding-bottom: 8px;
`;
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

export interface RoundProps {
  className?: string;
  style?: React.CSSProperties;
  unionId: Principal;
  votes: [ChoiceId, Shares][];
  voting: Voting;
  votingConfig: VotingConfig;
  onVoted(vote: [ChoiceId, Shares][]): void;
}

type Info = { group: Group; group_id: bigint; shares_info: SharesInfo };
type FormData = { choices: Choice[]; info: Info; fractions: Record<number, number> };

export const Round = styled(
  ({ unionId, onVoted, voting, votingConfig, votes, ...p }: RoundProps) => {
    const {
      control,
      setValue,
      reset,
      getValues,
      formState: { isValid },
    } = useForm<FormData>({
      defaultValues: {
        choices: [],
        fractions: {},
      },
      mode: 'all',
    });
    const [shareInfos, setShareInfos] = useState<Info[] | null>(null);
    const { canister, data } = useUnion(unionId);
    const { View } = useRender<Choice>({
      canisterId: unionId,
      type: 'Choice',
    });

    useEffect(() => {
      canister.list_voting_choices({
        page_req: {
          page_index: 0,
          page_size: 100, // FIXME
          sort: null,
          filter: { voting_id: { Common: voting.id[0]! } },
        },
        query_delegation_proof_opt: [],
      });
    }, []);

    const choices = useMemo(
      () =>
        (data.list_voting_choices?.page.data || []).filter((c) =>
          voting.choices.includes(c.id[0]!),
        ),
      [voting.choices, data.list_voting_choices],
    );

    const groups = useMemo(
      () =>
        Array.from(
          new Set([
            ...getGroupsFromThresholds(votingConfig.win),
            ...getGroupsFromThresholds(votingConfig.quorum),
            ...getGroupsFromThresholds(votingConfig.next_round),
          ]),
        ),
      [voting.choices],
    );

    useEffect(() => {
      Promise.all(
        groups.map(async (group_id) => {
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
    }, [groups, setShareInfos, voting.choices]);

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

      await canister.cast_my_vote({
        id: voting.id[0]!,
        vote: {
          Common: {
            shares_info: values.info.shares_info,
            vote: values.choices.map((c) => {
              const fraction = values.fractions[Number(c.id[0])] || 0;

              return [c.id[0]!, String(fraction / 100)];
            }),
          },
        },
      });
      const { vote } = await canister.get_my_vote({
        voting_id: voting.id[0]!,
        group_id: values.info.group_id,
      });

      reset({ choices: [], fractions: {} });
      onVoted(vote);
    }, [reset, canister, voting, getValues, onVoted]);

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
          name='choices'
          control={control}
          rules={{
            required: 'This field is required',
          }}
          render={({ field, fieldState: { error } }) => (
            <FlatSelect
              align='column'
              onChange={(indexes) => {
                const selected = choices.filter((c, i) => indexes.includes(i));

                field.onChange(selected);

                if (shareInfos?.length == 1) {
                  setValue('info', shareInfos[0]);
                }
              }}
              value={field.value
                .map((v) => choices.findIndex((c) => c.id[0] == v.id[0]))
                .filter((v) => v >= 0)}
            >
              {choices.map((choice) => {
                const vote = votes.find(
                  ([choiceId, shares]) => choice.id[0] == choiceId && !!shares,
                );
                const selected = !!field.value.find((c) => c.id[0] == choice.id[0]);

                return (
                  <ChoiceItem key={String(choice.id[0])}>
                    <View value={choice} settings={settings} />
                    {vote && <Text color='green'>Chosen with {String(vote[1])} shares</Text>}
                    {selected && (
                      <Controller
                        // @ts-expect-error
                        name={`fractions.${Number(choice.id[0])}`}
                        control={control}
                        rules={{
                          required: 'This field is required',
                          validate: {
                            calc: (share) => {
                              if (Number(share) <= 0) {
                                return 'Value must be > 0%';
                              }
                              if (Number(share) > 100) {
                                return 'Value must be <= 100%';
                              }
                              const fractions = getValues('fractions');
                              const sum = field.value
                                .map((c) => fractions[Number(c.id[0])] || 0)
                                .reduce((a, b) => a + b, 0);

                              if (sum <= 0) {
                                return 'Sum must be > 0%';
                              }
                              if (sum > 100) {
                                return 'Sum must be <= 100%';
                              }
                            },
                          },
                        }}
                        render={(p) => (
                          <TextField
                            label='Share %'
                            value={p.field.value == null ? '' : Number(p.field.value)}
                            onChange={(e) =>
                              p.field.onChange(
                                e.target.value ? Number(e.target.value.replace(',', '.')) : null,
                              )
                            }
                            helperText={p.fieldState.error?.message}
                            onClick={(e) => e.stopPropagation()}
                            type='number'
                          />
                        )}
                      />
                    )}
                  </ChoiceItem>
                );
              })}
            </FlatSelect>
          )}
        />
        <Controller
          name='info'
          control={control}
          rules={{ required: 'This field is required' }}
          render={({ field, fieldState: { error }, formState }) => {
            const { choices } = getValues();

            if (!choices.length) {
              return <></>;
            }

            if (!shareInfos?.length) {
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
                  {shareInfos.map((info) => (
                    <AdvancedOption
                      key={Number(info.group_id)}
                      value={info.group.name}
                      obj={info}
                    />
                  ))}
                </AdvancedSelect>
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
