import React, { useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { PageWrapper, SubmitButton as B, Field as F, Column, Text } from '@union/components';
import { useGateway, useUnion } from 'services';
import { useNavigate } from 'react-router-dom';
import { HAS_PROFILE_GROUP_ID } from 'envs';
import { defaultFieldProps } from '../../IDLRenderer';
import { useCurrentUnion } from '../context';
import { ProfileGroupInfo } from './ProfileGroupInfo';

const Field = styled(F)``;
const Button = styled(B)``;

const Controls = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;

  & > *:not(:last-child) {
    margin-right: 8px;
  }
`;

const Container = styled(PageWrapper)`
  ${Controls} {
    margin-bottom: 24px;
  }

  ${Field} {
    margin-bottom: 8px;
  }
`;

export interface ProfileProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Profile = ({ ...p }: ProfileProps) => {
  const nav = useNavigate();
  const { principal, ...current } = useCurrentUnion();
  const { canister, data } = useUnion(principal);
  const gateway = useGateway(process.env.GATEWAY_CANISTER_ID);

  useEffect(() => {
    current.fetchMyData();
    canister.get_my_unaccepted_group_shares_balance({
      group_id: HAS_PROFILE_GROUP_ID,
    });
  }, []);

  const handleInvite = useCallback(
    async (accept?: boolean) => {
      const qty = data.get_my_unaccepted_group_shares_balance?.balance;

      if (typeof qty == 'undefined') {
        return;
      }

      if (accept) {
        await canister.accept_my_group_shares({ group_id: HAS_PROFILE_GROUP_ID, qty });
        await gateway.canister.attach_to_union_wallet({ union_wallet_id: principal });
      } else {
        await canister.decline_my_group_shares({ group_id: HAS_PROFILE_GROUP_ID, qty });
      }

      await canister.get_my_unaccepted_group_shares_balance({
        group_id: HAS_PROFILE_GROUP_ID,
      });

      await current.fetchMyData();
    },
    [
      gateway,
      current.groups,
      current,
      principal,
      data.get_my_unaccepted_group_shares_balance?.balance,
    ],
  );

  return (
    <Container {...p} title='My profile'>
      <Controls>
        {data.get_my_unaccepted_group_shares_balance?.balance ? (
          <>
            <Button onClick={() => handleInvite(true)}>Accept invite</Button>
            <Button onClick={() => handleInvite(false)} color='red'>
              Decline invite
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => nav('invite')}>+ Invite</Button>
            <Button onClick={() => nav('change')}>Change profile</Button>
          </>
        )}
      </Controls>
      <Field title='Profile name' align='row' {...defaultFieldProps}>
        {current.profile?.name}
      </Field>
      <Field title='Description' align='row' {...defaultFieldProps}>
        {current.profile?.description}
      </Field>
      <Column {...p}>
        <Text variant='h5'>Groups</Text>
        {!!current.fetching.get_my_groups && <Text>fetching...</Text>}
        {!current.fetching.get_my_groups && !current.groups.length && (
          <Text>You are have no groups</Text>
        )}
        {current.groups.map((g) => (
          <ProfileGroupInfo key={String(g.id[0])} group={g} />
        ))}
      </Column>
    </Container>
  );
};
