import React from 'react';
import styled from 'styled-components';
import { PageWrapper, Pager, Button as B, Row as R } from '@union/components';
import { useUnion } from 'services';
import { NavLink, useParams } from 'react-router-dom';
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
  const { executionId } = useParams();
  const { principal } = useCurrentUnion();
  const { canister } = useUnion(principal);
  // const { View } = useRender<VotingConfig>({
  //   canisterId: principal,
  //   type: 'VotingConfig',
  // });

  return (
    <Container {...p} title='Execution history'>
      <Controls>
        <Button forwardedAs={NavLink} to={executionId ? '../execution-history/create' : 'create'}>
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
              filter: { from_timestamp: [], to_timestamp: [], endpoint: [] },
            },
            query_delegation_proof_opt: [],
          })
        }
        renderItem={(item: bigint) => (
          <ExecutionItem id={item} opened={executionId == String(item)} />
        )}
      />
    </Container>
  );
})``;
