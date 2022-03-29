import React, { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Text, Button as B } from 'components';
import { caseByCount, useTrigger } from 'toolkit';
import moment from 'moment';
import { useAuth, useWallet } from '../../../services';
import { Executor as E, ExecutorFormData } from '../../Executor';
import { useCurrentWallet } from '../context';

const Title = styled(Text)``;
const Button = styled(B)``;
const Executor = styled(E)``;

const Container = styled.div`
  display: flex;
  flex-direction: column;

  ${Title} {
    margin-bottom: 64px;
  }
  ${Executor} {
    margin-top: 32px;
  }
`;

export interface HistoryEntryProps {
  className?: string;
  style?: React.CSSProperties;
}

export const HistoryEntry = (p: HistoryEntryProps) => {
  const { identity } = useAuth();
  const { rnp, principal, permissions } = useCurrentWallet();
  const { canister, fetching, data } = useWallet(principal);
  const { entryId } = useParams();

  useTrigger(
    (rnp) => {
      if (!entryId) {
        return;
      }
      canister.get_history_entries({ ids: [BigInt(entryId)], rnp });
    },
    rnp,
    [entryId],
  );

  const entry = (data.get_history_entries?.entries || [])[0];

  const authorizeExecution = useCallback(() => {
    if (!entry) {
      return;
    }

    console.log('Not implemented');
    // canister.authorize_execution({});
  }, [entry]);

  if (!entryId) {
    return <span>Entry does not found {entryId}</span>;
  }

  if (fetching.get_history_entries) {
    return <span>Fetching...</span>;
  }

  if (!entry) {
    return <span>Entry does not exist {entryId}</span>;
  }

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
      <Text variant='p1'>Дата: {date.format('DD-MM-YYYY HH:mm:SS')}</Text>
      <Text variant='p1'>Статус: {status}</Text>
      <Text variant='p1'>
        Подтвердили выполнение: {entry.authorized_by.length}{' '}
        {caseByCount(entry.authorized_by.length, ['пользователь', 'пользователя', 'пользователей'])}
      </Text>
      <Text variant='p1'>Вы обладаете {!hasAccess ? 'не ' : ''}пермиссией</Text>
      {entryAuthorizedByMe ? (
        <Text variant='p1' weight='medium'>
          Подтверждено
        </Text>
      ) : (
        status == 'Pending' && (
          <Button disabled={!!fetching.authorize_execution} onClick={authorizeExecution}>
            Подтвердить
          </Button>
        )
      )}
      <Executor canisterId={principal} mode='view' data={formData} />
    </Container>
  );
};
