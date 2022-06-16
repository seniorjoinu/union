import { Row, Spinner, Text } from '@union/components';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useUnion } from 'services';
import styled from 'styled-components';
import { useCurrentUnion } from '../context';
import { computeTime } from '../IDLFields';

const Container = styled(Row)`
  align-items: center;
  ${Text} {
    align-self: center;
  }
  ${Spinner} {
    align-self: center;
  }
`;

export interface TimerProps {
  className?: string;
  style?: React.CSSProperties;
  createdAt: bigint;
  votingConfigId: bigint;
  children?: React.ReactNode;
}

export const Timer = styled(({ createdAt, votingConfigId, children, ...p }: TimerProps) => {
  const { principal } = useCurrentUnion();
  const { canister, data } = useUnion(principal);
  const [time, setTime] = useState<{ node: React.ReactNode; status: 'load' | 'active' | 'over' }>({
    node: <Spinner size={12} />,
    status: 'load',
  });
  const interval = useRef<number | null>(0);

  useEffect(() => {
    canister.get_voting_config({ id: votingConfigId, query_delegation_proof_opt: [] });
  }, []);

  const left = useMemo(() => {
    if (!data.get_voting_config) {
      return 0;
    }

    const { voting_config } = data.get_voting_config;
    const createdAtMs = Number(createdAt) / 10 ** 6;
    const duration = Number(voting_config.round.round_duration) / 10 ** 6;
    const delay = Number(voting_config.round.round_delay) / 10 ** 6;

    const now = Date.now();
    let left = createdAtMs + duration;

    while (left < now) {
      left += delay + duration;
    }

    return left;
  }, [data.get_voting_config, createdAt]);

  const calculate = useCallback(() => {
    if (!data.get_voting_config) {
      return;
    }

    const diff = left - Date.now();

    if (diff <= 0) {
      if (interval.current) {
        window.clearInterval(interval.current);
        interval.current = null;
      }
      setTime({ node: <>Time is over</>, status: 'over' });
      return;
    }
    const time = computeTime(diff, 1);

    if (time) {
      setTime({ node: <>{time}</>, status: 'active' });
    }
  }, [data.get_voting_config, setTime, left]);

  useEffect(() => {
    if (!data.get_voting_config) {
      return;
    }

    interval.current = window.setInterval(calculate, 1000);

    return () => {
      if (interval.current) {
        window.clearInterval(interval.current);
        interval.current = null;
      }
    };
  }, [calculate]);

  return (
    <Container {...p}>
      <Text variant='caption' color='dark'>
        {time.node}
      </Text>
      {time.status == 'active' && (
        <Text variant='caption' color='grey'>
          left
        </Text>
      )}
    </Container>
  );
})``;
