import React, { useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { PageWrapper, SubmitButton as B, Text } from '@union/components';
import { useGateway, useUnion } from 'services';
import { useNavigate } from 'react-router-dom';
import { HAS_PROFILE_GROUP_ID } from 'envs';
import { useCurrentUnion } from '../context';
import { Groups } from './Groups';

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
  ${Controls}, ${Groups} {
    margin-bottom: 24px;
  }
`;

export interface ProfileProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Profile = ({ ...p }: ProfileProps) => {
  const nav = useNavigate();
  const { principal, profile, groups, fetchMyData } = useCurrentUnion();
  const { canister, data } = useUnion(principal);
  const gateway = useGateway(process.env.GATEWAY_CANISTER_ID);

  useEffect(() => {
    fetchMyData();
    canister.get_my_unaccepted_group_shares_balance({
      group_id: HAS_PROFILE_GROUP_ID,
    });
  }, []);

  const handleAccept = useCallback(async () => {
    const qty = data.get_my_unaccepted_group_shares_balance?.balance || BigInt(0);

    if (!qty) {
      return;
    }

    await canister.accept_my_group_shares({ group_id: HAS_PROFILE_GROUP_ID, qty });

    await gateway.canister.attach_to_union_wallet({ union_wallet_id: principal });
    await canister.get_my_unaccepted_group_shares_balance({
      group_id: HAS_PROFILE_GROUP_ID,
    });
  }, [gateway, groups, principal, data.get_my_unaccepted_group_shares_balance?.balance]);

  return (
    <Container {...p} title='My profile'>
      <Controls>
        {!!data.get_my_unaccepted_group_shares_balance?.balance && (
          <Button onClick={handleAccept}>Accept invite</Button>
        )}
        <Button onClick={() => nav('change')}>Change profile</Button>
      </Controls>
      <Text>{profile?.name}</Text>
      <Text>{profile?.description}</Text>
      <Groups />
    </Container>
  );
};
