import React from 'react';
import styled from 'styled-components';
import { Text } from 'components';
import { HistoryEntry } from 'wallet-ts';

const Error = styled(Text)`
  display: flex;
  flex-direction: column;
  white-space: pre-line;
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
        <Text variant='p1' color='green'>
          Результат: {ok}
        </Text>
      )}
      {err && (
        <Error variant='p1' color='red'>
          <Text variant='p1'>Код ошибки: {Object.keys(err[0]).join()}</Text>
          <Text variant='p1'>
            Причина: {'\n'}
            {err[1]}
          </Text>
        </Error>
      )}
    </Container>
  );
};
