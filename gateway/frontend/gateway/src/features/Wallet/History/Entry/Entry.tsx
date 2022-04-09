import React from 'react';
import styled from 'styled-components';
import { Text, PageWrapper } from 'components';
import { caseByCount } from 'toolkit';
import moment from 'moment';
import { HistoryEntry } from 'wallet-ts';
import { useAuth } from 'services';
import { Executor as E, ExecutorFormData } from '../../../Executor';
import { useCurrentWallet } from '../../context';
import { CallResult } from './CallResult';

const Declined = styled(Text)`
  display: flex;
  flex-direction: column;
  color: red;
`;
const Executor = styled(E)``;

const Children = styled.div``;
const Participants = styled.div`
  display: flex;
  flex-direction: column;

  & > *:not(:last-child) {
    margin-bottom: 8px;
  }
`;
const Container = styled(PageWrapper)`
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
  renderControls?(p: {
    isPending: boolean;
    entryAuthorizedByMe: boolean;
    hasAccess: boolean;
  }): React.ReactNode;
}

export const Entry = ({ entry, children, renderControls = () => null, ...p }: EntryProps) => {
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
    authorization_delay_nano: 0, // FIXME
    program: sequence.map(({ cycles, endpoint, args }) => ({
      cycles: String(cycles),
      args_candid: 'CandidString' in args ? args.CandidString : [],
      args_encoded: 'Encoded' in args ? args.Encoded : [],
      endpoint: {
        canister_id: endpoint.canister_id.toString(),
        method_name: endpoint.method_name,
      },
    })),
  };

  const declined = 'Declined' in entry.entry_type ? entry.entry_type.Declined : null;
  const executed = 'Executed' in entry.entry_type ? entry.entry_type.Executed : null;
  const isPending = 'Pending' in entry.entry_type;

  return (
    <Container {...p} title='Execution'>
      {renderControls({ isPending, entryAuthorizedByMe, hasAccess })}
      <Text variant='p1'>Date: {date.format('DD-MM-YYYY HH:mm:ss')}</Text>
      <Text variant='p1'>Status: {status}</Text>
      {executed && (
        <Text variant='p1'>
          Executed at:{' '}
          {moment(Math.ceil(Number(executed[0]) / 10 ** 6)).format('DD-MM-YYYY HH:mm:ss')}
        </Text>
      )}
      {declined && (
        <Declined>
          <Text variant='p1'>
            Rejected at:{' '}
            {moment(Math.ceil(Number(declined[0]) / 10 ** 6)).format('DD-MM-YYYY HH:mm:ss')}
          </Text>
          <Text variant='p1'>Reason for rejection: {declined[1]}</Text>
        </Declined>
      )}
      <Text variant='p1'>Access: {hasAccess ? 'yes' : 'no'}</Text>
      <Text variant='p1'>Approved by you: {entryAuthorizedByMe ? 'yes' : 'no'}</Text>
      {!!entry.authorized_by.length && (
        <Participants>
          <Text variant='p1'>
            Execution approvers: {entry.authorized_by.length}{' '}
            {caseByCount(entry.authorized_by.length, ['user', 'user', 'users'])}
          </Text>
          {entry.authorized_by.map((p) => (
            <Text key={p.toString()} variant='p2' color='grey'>
              {p.toString()}
            </Text>
          ))}
        </Participants>
      )}
      {children && <Children>{children}</Children>}
      <Executor
        canisterId={principal}
        mode='view'
        data={formData}
        renderResult={(index) => <CallResult entry={entry} index={index} />}
      />
    </Container>
  );
};
