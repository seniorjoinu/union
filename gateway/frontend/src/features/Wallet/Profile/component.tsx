import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { PageWrapper, SubmitButton as B } from '@union/components';
import { useGateway, useUnion } from 'services';
import { HAS_PROFILE_GROUP_ID } from '../../../envs';
import { useCurrentUnion } from '../context';

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
`;

export interface ProfileProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Profile = ({ ...p }: ProfileProps) => {
  const { principal, profile, groups } = useCurrentUnion();
  const { canister, data } = useUnion(principal);
  const gateway = useGateway(process.env.GATEWAY_CANISTER_ID);

  useEffect(() => {
    canister.get_my_unaccepted_group_shares_balance({
      group_id: HAS_PROFILE_GROUP_ID,
    });
  }, []);

  const handleAccept = useCallback(async () => {
    const qty = data.get_my_unaccepted_group_shares_balance?.balance || 0n;

    if (!qty) {
      return;
    }

    await canister.accept_my_group_shares({ group_id: HAS_PROFILE_GROUP_ID, qty });

    await gateway.canister.attach_to_union_wallet({ union_wallet_id: principal });
  }, [gateway, groups, principal, data.get_my_unaccepted_group_shares_balance?.balance]);

  return (
    <Container {...p} title='My profile'>
      <Controls>
        {!!data.get_my_unaccepted_group_shares_balance?.balance && (
          <Button onClick={handleAccept}>Accept invite</Button>
        )}
      </Controls>
      {/* {!!fetching.list_batches && <Text>fetching</Text>} */}
      {/* {!fetching.list_batches && !batches.length && <Text>Batches does not exist</Text>} */}
      {profile?.name}
      {profile?.description}
    </Container>
  );
};
