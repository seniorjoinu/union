import { Principal } from '@dfinity/principal';
import { Column, Spinner } from '@union/components';
import { GetProgramExecutionEntryMetaResponse, Program, RemoteCallArgs } from 'ledger-ts';
import React, { useMemo } from 'react';
import { get } from 'react-hook-form';
import styled from 'styled-components';
import { useRender, ViewerSettings } from '../../IDLRenderer';
import { CandidEncodedArgs } from '../IDLFields';

const Container = styled(Column)``;

export interface ExecutionItemProgramProps {
  className?: string;
  style?: React.CSSProperties;
  ledger: Principal;
  meta: GetProgramExecutionEntryMetaResponse;
  program?: Program;
  fetching: boolean;
}

export const ExecutionItemProgram = styled(
  ({ ledger, program, fetching, ...p }: ExecutionItemProgramProps) => {
    const { View: Program } = useRender<Program>({
      canisterId: ledger,
      type: 'Program',
    });

    const progSettings: ViewerSettings<Program> = useMemo(
      () => ({
        fields: {
          'RemoteCallSequence.-1.args': {
            adornment: {
              kind: 'replace',
              render: (ctx, path, name) => {
                const args = get(ctx.value, path) as RemoteCallArgs;
                const canisterId = get(
                  ctx.value,
                  path.replace('.args', '.endpoint.canister_id'),
                ) as Principal;
                const methodName = get(
                  ctx.value,
                  path.replace('.args', '.endpoint.method_name'),
                ) as string;

                return (
                  <CandidEncodedArgs args={args} canisterId={canisterId} methodName={methodName} />
                );
              },
            },
          },
        },
      }),
      [],
    );

    return (
      <Container {...p}>
        {!program && !!fetching && <Spinner />}
        {program && <Program value={program} settings={progSettings} />}
      </Container>
    );
  },
)``;
