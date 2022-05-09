import React from 'react';
import styled from 'styled-components';
import { Text } from '@union/components';
import { HistoryEntry } from 'union-ts';

const Result = styled(Text)`
  display: flex;
  flex-direction: column;
  white-space: pre-wrap;
  word-break: break-word;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

export interface CallResultProps {
  className?: string;
  style?: React.CSSProperties;
  entry: HistoryEntry;
  index: number;
}

export const CallResult = ({ entry, index, ...p }: CallResultProps) => {
  if ('Pending' in entry.entry_type || 'Declined' in entry.entry_type) {
    return null;
  }

  const executed = entry.entry_type.Executed[1][index];

  if (!executed) {
    return null;
  }

  const ok = 'Ok' in executed ? executed.Ok : null;
  const err = 'Err' in executed ? executed.Err : null;

  return (
    <Container {...p}>
      {ok && (
        <Result variant='p1' color='green'>
          <Text variant='p1'>Result:</Text>
          <Text variant='p1'>{ok}</Text>
        </Result>
      )}
      {err && (
        <Result variant='p1' color='red'>
          <Text variant='p1'>Error code: {Object.keys(err[0]).join()}</Text>
          <Text variant='p1'>
            Reason: {'\n'}
            {err[1]}
          </Text>
        </Result>
      )}
    </Container>
  );
};
