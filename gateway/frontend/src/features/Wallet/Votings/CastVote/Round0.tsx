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
} from '@union/components';
import { useUnion } from 'services';
import styled from 'styled-components';
import { Choice, ChoiceId, Group, Shares, SharesInfo, Voting, VotingConfig } from 'union-ts';
import { Controller, useForm } from 'react-hook-form';
import { normalizeValues, useRender, ViewerSettings } from '../../../IDLRenderer';
import { useChoices } from './hook';

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
  readonly?: boolean;
  unionId: Principal;
  votes: [ChoiceId, Shares][];
  voting: Voting;
  votingConfig: VotingConfig;
  onVoted(vote: [ChoiceId, Shares][]): void;
}

type Info = { group: Group; group_id: bigint; shares_info: SharesInfo };
type FormData = { choice: Choice; info: Info };

export const Round0 = styled(
  ({ unionId, onVoted, voting, votingConfig, votes, readonly, ...p }: Round0Props) => {
    const {
      control,
      setValue,
      resetField,
      reset,
      getValues,
      formState: { isValid },
    } = useForm<FormData>({
      mode: 'all',
    });
    const { canister } = useUnion(unionId);
    const { View } = useRender<Choice>({
      canisterId: unionId,
      type: 'Choice',
    });
    const choiceInfos = useMemo(
      () => [
        ...(typeof voting.approval_choice[0] !== 'undefined'
          ? [{ choice_id: voting.approval_choice[0], thresholds: [votingConfig.approval] }]
          : []),
        ...(typeof voting.rejection_choice[0] !== 'undefined'
          ? [{ choice_id: voting.rejection_choice[0], thresholds: [votingConfig.rejection] }]
          : []),
      ],
      [voting, votingConfig],
    );
    const { choices, shareInfos, getShareInfo } = useChoices({
      unionId,
      votingId: voting.id[0]!,
      at: voting.created_at,
      choiceInfos,
    });

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
        throw new Error('Wrong choice');
      }
      const { vote } = await canister.get_my_vote({
        voting_id: voting.id[0]!,
        group_id: values.info.group_id,
      });

      reset();
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
        {!readonly && (
          <Text variant='h5' weight='medium'>
            Cast your vote
          </Text>
        )}
        <Controller
          name='choice'
          control={control}
          rules={{ required: 'This field is required' }}
          render={({ field, fieldState: { error } }) => (
            <FlatSelect
              multiple={false}
              readonly={readonly}
              onChange={(indexes) => {
                const choice = indexes.length ? choices[indexes[0]] : null;

                field.onChange(choice);
                resetField('info');

                if (!choice) {
                  return;
                }

                const choiceShareInfos = getShareInfo(choice.id[0]!);

                if (choiceShareInfos.length) {
                  setValue('info', choiceShareInfos[0]);
                }
              }}
              value={[choices.findIndex((c) => c.id[0] == field.value?.id[0])]}
            >
              {choices.map((choice) => (
                <Column key={String(choice.id[0])}>
                  <View value={choice} settings={settings} />
                  {votes.find(([choiceId, shares]) => choice.id[0] == choiceId && !!shares) && (
                    <Text color='green'>Chosen</Text>
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

            const choiceShareInfos = getShareInfo(choice.id[0]!);

            if (!choiceShareInfos.length) {
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
