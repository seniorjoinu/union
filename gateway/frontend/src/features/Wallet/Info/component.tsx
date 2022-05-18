import React, { useEffect } from 'react';
import styled from 'styled-components';
import { PageWrapper, Text, SubmitButton as SB, Field as F } from '@union/components';
import { useUnion } from 'services';
import { NavLink } from 'react-router-dom';
import moment from 'moment';
import { useCurrentUnion } from '../context';

const Field = styled(F)``;
const Button = styled(SB)``;
const Controls = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;

  & > *:not(:last-child) {
    margin-right: 8px;
  }
`;
const Container = styled(PageWrapper)`
  ${Button} {
    align-self: flex-start;
  }

  & > ${Field} {
    margin-bottom: 8px;
  }

  ${Field} ${Field} {
    padding-left: 8px;
    border-left: 1px solid ${({ theme }) => theme.colors.grey};
  }
`;

export interface InfoProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Info = ({ ...p }: InfoProps) => {
  const { principal } = useCurrentUnion();
  const { canister, fetching, data } = useUnion(principal);

  useEffect(() => {
    canister.get_settings();
  }, []);

  const settings = data.get_settings?.settings || null;

  return (
    <Container {...p} title='Wallet info'>
      <Controls>
        <Button forwardedAs={NavLink} to='edit-info'>
          Edit info
        </Button>
        <Button forwardedAs={NavLink} to='upgrade-version'>
          Upgrade version
        </Button>
      </Controls>
      {!!fetching.get_settings && <Text>fetching...</Text>}
      {settings && (
        <>
          <Field title='ID' align='row'>
            {principal.toString()}
          </Field>
          <Field title='Name' align='row'>
            {settings.name}
          </Field>
          <Field title='Description' align='row'>
            {settings.description}
          </Field>
          <Field title='Version' align='row'>
            ?
          </Field>
          <Field title='Balance' align='row'>
            ?
          </Field>
          <Field title='Storage' align='row'>
            ?
          </Field>
          {settings.history_ledgers.map((ledger, i) => {
            const timestamp = moment(Number(ledger.timestamp) / 10 ** 6).format(
              'DD-MM-YY HH:mm:SS',
            );

            return (
              <Field key={String(i)} title={`Ledger #${i}`}>
                {ledger.records.map((r, j) => (
                  <Field key={r.toString()} title={`Record #${j}`} align='row'>
                    {r.toString()}
                  </Field>
                ))}

                <Field title='Timestamp' align='row'>
                  Timestamp: {timestamp}
                </Field>
              </Field>
            );
          })}
        </>
      )}
    </Container>
  );
};
