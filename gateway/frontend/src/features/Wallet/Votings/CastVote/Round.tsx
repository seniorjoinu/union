import React, { useCallback, useEffect, useMemo } from 'react';
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
  Row,
} from '@union/components';
import { useUnion } from 'services';
import styled from 'styled-components';
import {
  Choice,
  ChoiceId,
  GetVotingResultsResponse,
  Group,
  Shares,
  SharesInfo,
  Voting,
  VotingConfig,
} from 'union-ts';
import { Controller, useForm } from 'react-hook-form';
import { normalizeValues } from '../../../IDLRenderer';
import { useChoices } from './hook';
import { ChoiceItem } from './ChoiceItem';

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
  readonly?: boolean;
  unionId: Principal;
  votes: [ChoiceId, Shares][];
  voting: Voting;
  votingConfig: VotingConfig;
  results: GetVotingResultsResponse['results'];
  onVoted(vote: [ChoiceId, Shares][]): void;
}

type Info = { group: Group; group_id: bigint; shares_info: SharesInfo };
type FormData = { choices: Choice[]; info: Info; fractions: Record<number, number> };

export const Round = styled(
  ({ unionId, onVoted, voting, votingConfig, votes, readonly, results, ...p }: RoundProps) => {
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
    const { canister, data } = useUnion(unionId);

    const choiceInfos = useMemo(() => {
      let regular = (data.list_voting_choices?.page.data || []).map((choice) => ({
        choice_id: choice.id[0]!,
        choice,
        thresholds: [votingConfig.win, votingConfig.quorum, votingConfig.next_round],
      }));

      if (readonly) {
        return regular;
      }

      regular = regular.filter((c) => voting.choices.includes(c.choice_id));

      return [
        ...regular,
        ...(typeof voting.rejection_choice[0] !== 'undefined'
          ? [{ choice_id: voting.rejection_choice[0], thresholds: [votingConfig.rejection] }]
          : []),
      ];
    }, [voting.choices, data.list_voting_choices, votingConfig, readonly]);

    const { choices, shareInfos, getShareInfo } = useChoices({
      unionId,
      votingId: voting.id[0]!,
      at: voting.created_at,
      choiceInfos,
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

    const submit = useCallback(async () => {
      const values: FormData = normalizeValues(getValues());

      if (values.choices.length == 1 && values.choices[0].id[0] == voting.rejection_choice[0]) {
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
              vote: values.choices.map((c) => {
                const fraction = values.fractions[Number(c.id[0])] || 0;

                return [c.id[0]!, String(fraction / 100)];
              }),
            },
          },
        });
      }

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
        {readonly ? (
          <Text variant='h5' weight='medium'>
            Voting choices
          </Text>
        ) : (
          <Text variant='h5' weight='medium'>
            Cast your vote
          </Text>
        )}
        <Controller
          name='choices'
          control={control}
          rules={{
            required: 'This field is required',
          }}
          render={({ field, fieldState: { error } }) => {
            const value = field.value
              .map((v) => choices.findIndex((c) => c.id[0] == v.id[0]))
              .filter((v) => v >= 0);
            const highlighted = choices
              .map((c, i) =>
                (votes.find(([choiceId, shares]) => c.id[0] == choiceId && !!shares) ? i : null),
              )
              .filter((i): i is number => i !== null);

            return (
              <FlatSelect
                align='column'
                readonly={readonly}
                onChange={(indexes) => {
                  const selected = choices.filter((c, i) => indexes.includes(i));

                  const reject = selected.find((s) => s.id[0] == voting.rejection_choice[0]);

                  if (reject) {
                    field.onChange([reject]);
                    const shares = getShareInfo(voting.rejection_choice[0]);

                    setValue('info', shares[0]);
                    // @ts-expect-error
                    setValue(`fractions.${Number(reject.id[0])}`, 100);
                    return;
                  }

                  field.onChange(selected);

                  if (shareInfos?.length == 1) {
                    setValue('info', shareInfos[0]);
                  }
                }}
                value={value}
                highlighted={highlighted}
              >
                {choices.map((choice) => {
                  const vote = votes.find(
                    ([choiceId, shares]) => choice.id[0] == choiceId && !!shares,
                  );
                  const selected = !!field.value.find((c) => c.id[0] == choice.id[0]);

                  return (
                    <ChoiceItem
                      key={String(choice.id[0])}
                      vote={vote}
                      unionId={unionId}
                      choice={choice}
                      results={results.find((r) => r[0] == choice.id[0])?.[1]}
                      voting={voting}
                    >
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
                          render={(p) =>
                            (choice.id[0] !== voting.rejection_choice[0] ? (
                              <TextField
                                label='Share %'
                                value={p.field.value == null ? '' : Number(p.field.value)}
                                onChange={(e) =>
                                  p.field.onChange(
                                    e.target.value
                                      ? Number(e.target.value.replace(',', '.'))
                                      : null,
                                  )
                                }
                                helperText={p.fieldState.error?.message}
                                onClick={(e) => e.stopPropagation()}
                                type='number'
                              />
                            ) : (
                              <></>
                            ))
                          }
                        />
                      )}
                    </ChoiceItem>
                  );
                })}
              </FlatSelect>
            );
          }}
        />
        <Controller
          name='info'
          control={control}
          rules={{
            validate: {
              required: (value) => {
                const { choices } = getValues();

                if (choices.length == 1 && choices[0].id[0] == voting.rejection_choice[0]) {
                  return true;
                }
                return !!value || 'This field is required';
              },
            },
          }}
          render={({ field, fieldState: { error }, formState }) => {
            const { choices } = getValues();

            if (!choices.length) {
              return <></>;
            }

            const shares = getShareInfo(choices[0].id[0]);

            if (!shares.length) {
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
                  {shares.map((info) => (
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
        {!readonly && (
          <Button disabled={!isValid} onClick={submit}>
            Cast vote
          </Button>
        )}
      </Container>
    );
  },
)``;
