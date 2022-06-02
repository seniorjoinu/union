import React, { useEffect, useMemo, useState } from 'react';
import { Accordeon, Text } from '@union/components';
import styled from 'styled-components';
import { GetVotingResultsResponse, Group, Voting } from 'union-ts';
import { Principal } from '@dfinity/principal';
import { get } from 'react-hook-form';
import { useRender, ViewerSettings } from '../../../IDLRenderer';
import { GroupInfo } from '../../Groups';
import { ChoiceInfo } from '../ChoiceInfo';

export interface ResultsProps {
  className?: string;
  style?: React.CSSProperties;
  unionId: Principal;
  results: GetVotingResultsResponse['results'];
  voting: Voting;
}

export const Results = styled(({ results, unionId, voting, ...p }: ResultsProps) => {
  const { View } = useRender<GetVotingResultsResponse>({
    canisterId: unionId,
    type: 'GetVotingResultsResponse',
  });

  const settings: ViewerSettings<GetVotingResultsResponse> = useMemo(
    () => ({
      fields: {
        results: {
          label: '',
        },
        'results.-1.0': {
          adornment: {
            kind: 'replace',
            render: (ctx, path) => {
              const choiceId = get(ctx.value, path);
              const winner = voting.winners.find((w) => w.choices.includes(choiceId));

              return (
                <ChoiceInfo
                  unionId={unionId}
                  choiceId={choiceId}
                  votingId={voting.id[0]!}
                  chips={
                    winner
                      ? [
                        <Text variant='caption' color='green'>
                          {`winner of round ${winner.round}`}
                        </Text>,
                        ]
                      : []
                  }
                />
              );
            },
          },
        },
        'results.-1.1.-1': {
          adornment: {
            kind: 'replace',
            render: (ctx, path) => {
              const power = get(ctx.value, path);
              const twp = voting.total_voting_power_by_group.find((twp) => twp[0] == power[0]);

              return (
                <GroupInfo
                  groupId={power[0]}
                  shares={power[1]}
                  chips={twp ? [`of ${String(twp[1])}`] : []}
                  mode='short'
                  to={`../groups/${String(power[0])}`}
                />
              );
            },
          },
        },
      },
    }),
    [voting],
  );

  const completed = ['Fail', 'Rejected', 'Success'].includes(Object.keys(voting.status)[0]);

  return (
    <Accordeon title='Stats' {...p} isDefaultOpened={completed}>
      <View style={{ padding: '8px 0' }} value={{ results }} settings={settings} />
    </Accordeon>
  );
})``;
