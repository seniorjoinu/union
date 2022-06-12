import { Principal } from '@dfinity/principal';
import { Column, Field, Spinner } from '@union/components';
import {
  GetProgramExecutionEntryMetaResponse,
  Program,
  ProgramExecutionResult,
  RemoteCallArgs,
} from 'ledger-ts';
import React, { useCallback, useEffect, useMemo } from 'react';
import { get } from 'react-hook-form';
import { useHistoryLedger } from 'services';
import styled from 'styled-components';
import { defaultFieldProps, useRender, ViewerSettings } from '../../IDLRenderer';
import { CandidEncodedArgs, CandidEncodedResult } from '../IDLFields';

const Container = styled(Column)``;

export interface ExecutionItemProgramProps {
  className?: string;
  style?: React.CSSProperties;
  id: bigint;
  ledger: Principal;
  meta: GetProgramExecutionEntryMetaResponse;
  program?: Program;
  fetching: boolean;
}

export const ExecutionItemProgram = styled(
  ({ ledger, program, fetching, id, ...p }: ExecutionItemProgramProps) => {
    const historyLedger = useHistoryLedger(ledger);
    const { View: Program } = useRender<Program>({
      canisterId: ledger,
      type: 'Program',
    });
    const { View: Result } = useRender<ProgramExecutionResult>({
      canisterId: ledger,
      type: 'ProgramExecutionResult',
    });

    useEffect(() => {
      historyLedger.canister.get_program_execution_entry_result({ id });
    }, []);

    const endpoints = useMemo(() => {
      if (!program || 'Empty' in program) {
        return [];
      }
      return program.RemoteCallSequence.map((p) => p.endpoint);
    }, [program]);

    const result = historyLedger.data.get_program_execution_entry_result?.result[0];

    const getResult = useCallback(
      (index: number): React.ReactNode => {
        if (historyLedger.fetching.get_program_execution_entry_result) {
          return <Spinner />;
        }

        if (!result || 'Empty' in result || !result.RemoteCallSequence[index]) {
          return 'Empty';
        }

        const value = result.RemoteCallSequence[index];
        const endpoint = endpoints[index];

        if ('Err' in value) {
          return (
            <Field
              title={Object.keys(value.Err[0] || {})[0]}
              {...defaultFieldProps}
              align='column'
              color='red'
            >
              {value.Err[1]}
            </Field>
          );
        }

        return (
          <Field
            title='Ok'
            {...defaultFieldProps}
            align='column'
            color='green'
            weight={{ title: 'medium' }}
          >
            <CandidEncodedResult
              canisterId={endpoint.canister_id}
              methodName={endpoint.method_name}
              value={Buffer.from(value.Ok)}
            />
          </Field>
        );
      },
      [result, endpoints, historyLedger.fetching.get_program_execution_entry_result],
    );

    const progSettings: ViewerSettings<Program> = useMemo(
      () => ({
        fields: {
          'RemoteCallSequence.-1.endpoint': {
            order: 11,
          },
          'RemoteCallSequence.-1.cycles': {
            order: 12,
          },
          'RemoteCallSequence.-1.args': {
            order: 13,
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
                const index = Number(path.replace('.args', '').replace('RemoteCallSequence.', ''));

                return (
                  <>
                    <CandidEncodedArgs
                      args={args}
                      canisterId={canisterId}
                      methodName={methodName}
                    />
                    {getResult(index)}
                  </>
                );
              },
            },
          },
        },
      }),
      [getResult],
    );

    return (
      <Container {...p}>
        {!program && !!fetching && <Spinner />}
        {program && <Program value={program} settings={progSettings} />}
      </Container>
    );
  },
)``;
