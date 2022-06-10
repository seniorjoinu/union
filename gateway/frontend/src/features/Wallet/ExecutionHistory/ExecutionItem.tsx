import { Principal } from '@dfinity/principal';
import { Accordeon, Column, Field, Row, Spinner, Text, withBorder } from '@union/components';
import { GetProgramExecutionEntryMetaResponse } from 'ledger-ts';
import moment from 'moment';
import React, { useEffect, useMemo } from 'react';
import { useHistoryLedger } from 'services';
import styled from 'styled-components';
import { useRender, ViewerSettings } from '../../IDLRenderer';
import { AccessConfigInfo } from '../AccessConfigs';
import { ProfileInfo } from '../Profile';
import { VotingConfigInfo } from '../VotingConfigs';
import { ExecutionItemProgram } from './ExecutionItemProgram';
import { ExecutionItemResults } from './ExecutionItemResults';

const Header = styled(Row)`
  & > ${Text}:first-child {
    flex-grow: 1;
    margin-right: 16px;
  }
  & > ${Text}:last-child {
    flex-shrink: 0;
  }
`;
const Container = withBorder(
  styled(Column)`
    padding: 8px;
  `,
  { withQuad: false },
);

export interface ExecutionItemProps {
  className?: string;
  style?: React.CSSProperties;
  id: bigint;
  ledger: Principal;
  children?: React.ReactNode;
}

export const ExecutionItem = styled(({ id, ledger, children, ...p }: ExecutionItemProps) => {
  const { canister, data, fetching } = useHistoryLedger(ledger);
  const { View: Meta } = useRender<GetProgramExecutionEntryMetaResponse>({
    canisterId: ledger,
    type: 'GetProgramExecutionEntryMetaResponse',
  });

  useEffect(() => {
    canister.get_program_execution_entry_meta({ id });
    canister.get_program_execution_entry_program({ id });
  }, []);

  const meta = data.get_program_execution_entry_meta;
  const program = data.get_program_execution_entry_program?.program[0];

  const metaSettings: ViewerSettings<GetProgramExecutionEntryMetaResponse> = useMemo(
    () => ({
      fields: {
        initiator: {
          order: 1,
          adornment: {
            kind: 'replace',
            render: (ctx) => (
              <Field
                title='Initiator'
                weight={{ title: 'medium' }}
                variant={{ title: 'p3', value: 'p3' }}
                align='row'
              >
                <ProfileInfo profileId={ctx.value.initiator} variant='p3' />
              </Field>
            ),
          },
        },
        program_executed_with: {
          adornment: {
            kind: 'replace',
            render: (ctx, path) => {
              let info = null;

              if ('WithAccessConfig' in ctx.value.program_executed_with) {
                info = (
                  <AccessConfigInfo
                    accessConfigId={ctx.value.program_executed_with.WithAccessConfig}
                    to={`../access-configs/${ctx.value.program_executed_with.WithAccessConfig}`}
                  />
                );
              } else {
                info = (
                  <VotingConfigInfo
                    votingConfigId={ctx.value.program_executed_with.WithVotingConfig}
                    to={`../voting-configs/${ctx.value.program_executed_with.WithVotingConfig}`}
                  />
                );
              }

              return (
                <Field
                  title='Program executed with'
                  weight={{ title: 'medium' }}
                  variant={{ title: 'p3', value: 'p3' }}
                  align='column'
                >
                  {info}
                </Field>
              );
            },
          },
        },
      },
    }),
    [],
  );

  const title = useMemo(() => {
    if (!program) {
      return null;
    }
    if ('Empty' in program) {
      return 'Empty execution';
    }
    const methods = program.RemoteCallSequence.map((p) => p.endpoint.method_name).join(', ');

    return `Program execution of ${methods}`;
  }, [program]);

  const timestamp = useMemo(
    () => moment(Math.floor(Number(id) / 10 ** 6)).format("DD MMMM'YY HH:mm"),
    [id],
  );

  const endpoints = useMemo(() => {
    if (!program || 'Empty' in program) {
      return [];
    }
    return program.RemoteCallSequence.map((p) => p.endpoint);
  }, [program]);

  if (!meta) {
    return (
      <Container {...p}>
        <Spinner />
      </Container>
    );
  }

  return (
    <Container {...p}>
      <Header>
        <Text variant='h5' weight='medium'>
          {fetching.get_program_execution_entry_program ? <Spinner /> : title}
        </Text>
        <Text variant='caption' color='grey'>
          {timestamp}
        </Text>
      </Header>
      {children}
      <Meta value={meta} settings={metaSettings} />
      <Accordeon
        title={
          <Text variant='p3' weight='medium'>
            Program
          </Text>
        }
        {...p}
      >
        <ExecutionItemProgram
          meta={meta}
          program={program}
          fetching={!!fetching.get_program_execution_entry_program}
          ledger={ledger}
        />
      </Accordeon>
      <Accordeon
        title={
          <Text variant='p3' weight='medium'>
            Results
          </Text>
        }
        {...p}
      >
        <ExecutionItemResults id={id} meta={meta} ledger={ledger} endpoints={endpoints} />
      </Accordeon>
    </Container>
  );
})``;
