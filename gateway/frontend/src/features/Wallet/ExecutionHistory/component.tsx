import React, { useState } from 'react';
import styled from 'styled-components';
import { PageWrapper, Pager, Button as B, Row as R, Text } from '@union/components';
import { useUnion } from 'services';
import { NavLink } from 'react-router-dom';
import { Principal } from '@dfinity/principal';
import { ProgramExecutionFilter } from 'union-ts';
import { useCurrentUnion } from '../context';
import { ExecutionItem } from './ExecutionItem';
import { ExecutionFilter, defaultFilter } from './ExecutionFilter';

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
  ${ExecutionFilter} {
    margin-bottom: 32px;
  }
`;

export interface ExecutionHistoryProps {
  className?: string;
  style?: React.CSSProperties;
}

export const ExecutionHistory = styled(({ ...p }: ExecutionHistoryProps) => {
  const { principal } = useCurrentUnion();
  const { canister } = useUnion(principal);
  const [filter, setFilter] = useState<ProgramExecutionFilter>(defaultFilter);

  return (
    <Container {...p} title='Execution history'>
      <Controls>
        <Button forwardedAs={NavLink} to='create'>
          +
        </Button>
      </Controls>
      <ExecutionFilter filter={filter} onChange={setFilter} />
      <Pager
        size={5}
        filter={filter}
        fetch={({ index, size, filter }) =>
          canister.list_program_execution_entry_ids({
            page_req: {
              page_index: index,
              page_size: size,
              sort: null,
              filter,
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
