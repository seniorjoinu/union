import React, { useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { SubmitButton as B, Row, Text } from '@union/components';
import { Group } from 'union-ts';
import { useUnion } from 'services';
import { caseByCount } from 'toolkit';
import { NavLink } from 'react-router-dom';
import { DEFAULT_GROUP_IDS } from 'envs';
import { GroupInfo } from '../Groups';
import { useCurrentUnion } from '../context';

const Controls = styled(Row)`
  justify-content: flex-start;
  align-items: center;
`;
const Button = styled(B)``;

export interface ProfileGroupInfoProps {
  className?: string;
  style?: React.CSSProperties;
  group: Group;
}

export const ProfileGroupInfo = styled(({ group, ...p }: ProfileGroupInfoProps) => {
  const { principal } = useCurrentUnion();
  const { canister, data } = useUnion(principal);

  useEffect(() => {
    canister.get_my_group_shares_balance({ group_id: group.id[0]! });
    canister.get_my_unaccepted_group_shares_balance({
      group_id: group.id[0]!,
    });
  }, []);

  const handleAccept = useCallback(
    async (accept: boolean) => {
      const qty = data.get_my_unaccepted_group_shares_balance?.balance;

      if (typeof qty == 'undefined') {
        return;
      }

      if (accept) {
        await canister.accept_my_group_shares({ group_id: group.id[0]!, qty });
      } else {
        await canister.decline_my_group_shares({ group_id: group.id[0]!, qty });
      }

      await canister.get_my_unaccepted_group_shares_balance({
        group_id: group.id[0]!,
      });
    },
    [group, data],
  );

  const chips =
    typeof data.get_my_group_shares_balance !== 'undefined'
      ? [
          `${String(data.get_my_group_shares_balance?.balance)} ${caseByCount(
            parseInt(String(data.get_my_group_shares_balance?.balance)),
            ['share', 'shares', 'shares'],
          )}`,
        ]
      : [];

  return (
    <GroupInfo {...p} group={group} mode='long' chips={chips}>
      <Controls>
        {!!data.get_my_unaccepted_group_shares_balance?.balance && (
          <>
            <Text variant='caption' color='grey'>
              You have {String(data.get_my_unaccepted_group_shares_balance?.balance)} unaccepted
              shares
            </Text>
            <Button variant='caption' onClick={() => handleAccept(true)}>
              Accept
            </Button>
            <Button variant='caption' onClick={() => handleAccept(false)} color='red'>
              Decline
            </Button>
          </>
        )}
        {!DEFAULT_GROUP_IDS.includes(group.id[0]!) &&
          typeof data.get_my_group_shares_balance?.balance !== 'undefined' && (
            <>
              <Button
                variant='caption'
                forwardedAs={NavLink}
                to={`transfer/${String(group.id[0!])}`}
              >
                Transfer shares
              </Button>
              <Button
                variant='caption'
                color='red'
                forwardedAs={NavLink}
                to={`burn/${String(group.id[0!])}`}
              >
                Burn shares
              </Button>
            </>
          )}
      </Controls>
    </GroupInfo>
  );
})``;
