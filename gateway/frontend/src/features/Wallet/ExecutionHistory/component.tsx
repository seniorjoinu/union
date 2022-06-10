import React from 'react';
import styled from 'styled-components';
import { PageWrapper, Pager, Button as B, Row as R, Text } from '@union/components';
import { useUnion } from 'services';
import { NavLink, useParams } from 'react-router-dom';
import { Principal } from '@dfinity/principal';
import { useCurrentUnion } from '../context';
import { ExecutionItem } from './ExecutionItem';

const Button = styled(B)``;
const Controls = styled(R)`
  justify-content: flex-end;

  &:empty {
    display: none;
  }
`;

const Container = styled(PageWrapper)`
  ${Controls} {
    margin-bottom: 16px;
  }
`;

export interface ExecutionHistoryProps {
  className?: string;
  style?: React.CSSProperties;
}

export const ExecutionHistory = styled(({ ...p }: ExecutionHistoryProps) => {
  const { principal } = useCurrentUnion();
  const { canister } = useUnion(principal);

  return (
    <Container {...p} title='Execution history'>
      <Controls>
        <Button forwardedAs={NavLink} to='create'>
          +
        </Button>
      </Controls>
      <Pager
        size={5}
        fetch={({ index, size }) =>
          canister.list_program_execution_entry_ids({
            page_req: {
              page_index: index,
              page_size: size,
              sort: null,
              filter: {
                from_timestamp: [],
                to_timestamp: [],
                endpoint: [],
              },
            },
            query_delegation_proof_opt: [],
          })
        }
        renderItem={(item: bigint, extra: { history_ledger_canister_id: Principal } | undefined) =>
          (extra?.history_ledger_canister_id ? (
            <ExecutionItem id={item} ledger={extra?.history_ledger_canister_id} />
          ) : (
            <Text color='red' variant='p3'>
              Unknown ledger
            </Text>
          ))
        }
      />
    </Container>
  );
})``;
