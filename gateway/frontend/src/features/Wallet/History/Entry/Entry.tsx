import React from 'react';
import styled from 'styled-components';
import { Text } from 'components';
import { caseByCount } from 'toolkit';
import moment from 'moment';
import { HistoryEntry } from 'wallet-ts';
import { useAuth } from 'services';
import { Executor as E, ExecutorFormData } from '../../../Executor';
import { useCurrentWallet } from '../../context';

const Title = styled(Text)``;
const Executor = styled(E)``;

const Children = styled.div``;
const Participants = styled.div`
  display: flex;
  flex-direction: column;

  & > *:not(:last-child) {
    margin-bottom: 8px;
  }
`;
const Container = styled.div`
  display: flex;
  flex-direction: column;

  ${Title} {
    margin-bottom: 64px;
  }
  ${Executor} {
    margin-top: 32px;
  }

  ${Participants} {
    margin-bottom: 16px;
  }
`;

export interface EntryProps {
  className?: string;
  style?: React.CSSProperties;
  entry: HistoryEntry;
  children?: React.ReactNode;
}

export const Entry = ({ entry, children, ...p }: EntryProps) => {
  const { identity } = useAuth();
  const { permissions, principal } = useCurrentWallet();

  const sequence = 'RemoteCallSequence' in entry.program ? entry.program.RemoteCallSequence : [];
  const status = Object.keys(entry.entry_type)[0] || '';
  const date = moment(Math.ceil(Number(entry.timestamp) / 10 ** 6));
  const hasAccess = !!permissions.find(({ id }) => id == entry.permission_id);

  const myPrincipal = identity?.getPrincipal().toString();
  // eslint-disable-next-line react/destructuring-assignment
  const entryAuthorizedByMe = !!entry.authorized_by.find((p) => myPrincipal == p.toString());

  const formData: ExecutorFormData = {
    title: entry.title,
    description: entry.description,
    rnp: { role_id: entry.role_id, permission_id: entry.permission_id },
    program: sequence.map(({ cycles, endpoint, args_candid }) => ({
      cycles: String(cycles),
      args_candid,
      endpoint: {
        canister_id: endpoint.canister_id.toString(),
        method_name: endpoint.method_name,
      },
    })),
  };

  return (
    <Container {...p}>
      <Title variant='h2'>Произвольный вызов</Title>
      <Text variant='p1'>Дата: {date.format('DD-MM-YYYY HH:mm:ss')}</Text>
      <Text variant='p1'>Статус: {status}</Text>
      <Text variant='p1'>Доступ: {hasAccess ? 'Есть' : 'Нет'}</Text>
      <Text variant='p1'>Подтверждено вами: {entryAuthorizedByMe ? 'Да' : 'Нет'}</Text>
      {!!entry.authorized_by.length && (
        <Participants>
          <Text variant='p1'>
            Подтвердили выполнение: {entry.authorized_by.length}{' '}
            {caseByCount(entry.authorized_by.length, [
              'пользователь',
              'пользователя',
              'пользователей',
            ])}
          </Text>
          {entry.authorized_by.map((p) => (
            <Text key={p.toString()} variant='p2' color='grey'>
              {p.toString()}
            </Text>
          ))}
        </Participants>
      )}
      {children && <Children>{children}</Children>}
      <Executor canisterId={principal} mode='view' data={formData} />
    </Container>
  );
};
