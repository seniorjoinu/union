import { Text } from 'components';
import moment from 'moment';
import React from 'react';
import styled from 'styled-components';
import { HistoryEntry } from 'union-ts';
import { useCurrentUnion } from '../context';

const OpStatus = styled(Text)``;
const Title = styled(Text)``;
const Description = styled(Text)``;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const Container = styled.div<{ $highlighted: boolean }>`
  display: flex;
  flex-direction: column;
  background: ${({ $highlighted }) => ($highlighted ? 'black' : 'grey')};
  color: white;
  padding: 16px 24px;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    background: black;
  }

  ${Description}, ${Row}:not(:last-child) {
    margin-bottom: 8px;
  }
`;

export interface ItemProps {
  className?: string;
  style?: React.CSSProperties;
  entry: HistoryEntry;
}

export const Item = ({ entry, ...p }: ItemProps) => {
  const { permissions } = useCurrentUnion();
  const status = Object.keys(entry.entry_type)[0] || '';

  const sequence = 'RemoteCallSequence' in entry.program ? entry.program.RemoteCallSequence : [];
  const isPending = 'Pending' in entry.entry_type;
  const executedStatus = 'Executed' in entry.entry_type ? entry.entry_type.Executed : null;
  const date = moment(Math.ceil(Number(entry.timestamp) / 10 ** 6));
  const hasAccess = !!permissions.find((p) => p.id == entry.permission_id);

  return (
    <Container {...p} $highlighted={hasAccess && isPending}>
      <Row>
        <Title variant='h5'>{entry.title}</Title>
        <Text variant='p1'>{date.format('DD-MM-YY HH:mm:ss')}</Text>
      </Row>
      {!!entry.description && <Description variant='p1'>{entry.description}</Description>}
      {sequence.map((op, i) => {
        const callResult = executedStatus?.[1][i];
        const status = callResult ? Object.keys(callResult)[0] : '';

        return (
          // eslint-disable-next-line react/no-array-index-key
          <Row key={String(i)}>
            <Title variant='p1'>
              {op.endpoint.canister_id.toString()}:{op.endpoint.method_name || '*'}()
            </Title>
            <Title variant='p1'>
              {Number(op.cycles)} cycles{' '}
              {!!status && (
                <OpStatus color={status == 'Ok' ? 'lightgreen' : 'red'}>{status}</OpStatus>
              )}
            </Title>
          </Row>
        );
      })}
      <Row>
        <Title variant='p1'>You has {!hasAccess ? 'not ' : ''}permissions</Title>
        <Title variant='p1'>{status}</Title>
      </Row>
    </Container>
  );
};
