import { Chips, TextProps } from '@union/components';
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { VotingStatus } from 'union-ts';

export interface StatusChipsProps extends React.ComponentProps<typeof Chips> {
  status: VotingStatus;
}

export const StatusChips = styled(({ status, ...p }: StatusChipsProps) => {
  const { children, color } = useMemo(() => {
    let postfix = '';
    let color: TextProps['color'] = 'dark';

    if ('Round' in status) {
      postfix = String(status.Round);
    }
    if ('PreRound' in status) {
      postfix = String(status.PreRound);
    }
    if ('Success' in status) {
      color = 'green';
    }
    if ('Fail' in status || 'Rejected' in status) {
      color = 'red';
    }

    return { children: `${Object.keys(status)[0]}${postfix ? ` ${postfix}` : ''}`, color };
  }, [status]);

  return (
    <Chips variant='caption' weight='medium' color={color} {...p}>
      {children}
    </Chips>
  );
})``;
