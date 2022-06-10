import { Principal } from '@dfinity/principal';
import { Column, Field, Spinner } from '@union/components';
import {
  GetProgramExecutionEntryMetaResponse,
  ProgramExecutionResult,
  RawCandidCallResult,
  RemoteCallEndpoint,
} from 'ledger-ts';
import React, { useEffect, useMemo } from 'react';
import { get } from 'react-hook-form';
import { useHistoryLedger } from 'services';
import styled from 'styled-components';
import { useRender, ViewerSettings } from '../../IDLRenderer';
import { CandidEncodedResult } from '../IDLFields';

const Container = styled(Column)``;

export interface ExecutionItemResultsProps {
  className?: string;
  style?: React.CSSProperties;
  id: bigint;
  ledger: Principal;
  meta: GetProgramExecutionEntryMetaResponse;
  endpoints: RemoteCallEndpoint[];
}

export const ExecutionItemResults = styled(
  ({ id, ledger, endpoints, ...p }: ExecutionItemResultsProps) => {
    const { canister, data, fetching } = useHistoryLedger(ledger);
    const { View: Result } = useRender<ProgramExecutionResult>({
      canisterId: ledger,
      type: 'ProgramExecutionResult',
    });

    useEffect(() => {
      canister.get_program_execution_entry_result({ id });
    }, []);

    const result = data.get_program_execution_entry_result?.result[0];

    const resSettings: ViewerSettings<ProgramExecutionResult> = useMemo(
      () => ({
        fields: {
          'RemoteCallSequence.-1.Ok': {},
          'RemoteCallSequence.-1': {
            adornment: {
              kind: 'replace',
              render: (ctx, path, name) => {
                const value = get(ctx.value, path) as RawCandidCallResult;
                const index = parseInt(path.replace('RemoteCallSequence.', ''));
                const endpoint = endpoints[index];

                console.log('!!!!', index, path, endpoint, endpoints);

                if ('Err' in value) {
                  return (
                    <Field
                      title={Object.keys(value.Err[0] || {})[0] || name}
                      weight={{ title: 'medium' }}
                      variant={{ title: 'p3', value: 'p3' }}
                      align='column'
                      color='red'
                    >
                      {value.Err[1]}
                    </Field>
                  );
                }

                if (!endpoint) {
                  return null;
                }

                return (
                  <Field
                    title='Ok'
                    weight={{ title: 'medium' }}
                    variant={{ title: 'p3', value: 'p3' }}
                    align='column'
                    color='green'
                  >
                    <CandidEncodedResult
                      canisterId={endpoint.canister_id}
                      methodName={endpoint.method_name}
                      value={Buffer.from(value.Ok)}
                    />
                  </Field>
                );
              },
            },
          },
        },
      }),
      [endpoints],
    );

    return (
      <Container {...p}>
        {!result && !!fetching.get_program_execution_entry_result && <Spinner />}
        {result && <Result value={result} settings={resSettings} />}
      </Container>
    );
  },
)``;
