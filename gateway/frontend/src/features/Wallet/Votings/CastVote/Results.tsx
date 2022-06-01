import React, { useEffect, useMemo, useState } from 'react';
import { Accordeon } from '@union/components';
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
            render: (ctx, path) => (
              <ChoiceInfo
                unionId={unionId}
                choiceId={get(ctx.value, path)}
                votingId={voting.id[0]!}
              />
            ),
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

  return (
    <Accordeon title='Results'>
      <View value={{ results }} settings={settings} />
    </Accordeon>
  );
})``;
