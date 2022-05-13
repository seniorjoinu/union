import React, { useEffect } from 'react';
import styled from 'styled-components';
import { PageWrapper, Text, SubmitButton as SB, ImageFile as IF } from '@union/components';
import { useUnion } from 'services';
import { NavLink } from 'react-router-dom';
import moment from 'moment';
import { useCurrentUnion } from '../context';

const ImageFile = styled(IF)``;
const Field = styled(Text)`
  display: flex;
  flex-direction: column;

  & > & {
    margin-left: 8px;
  }
`;
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
  ${ImageFile} {
    height: 100px;
    width: 100px;
  }
  ${Button} {
    align-self: flex-start;
  }

  ${Field}, ${ImageFile} {
    margin-bottom: 8px;
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
          <Field>ID: {principal.toString()}</Field>
          <Field>Name: {settings.name}</Field>
          <Field>Description: {settings.description}</Field>
          <Field>Version: ?</Field>
          <Field>Balance: ?</Field>
          <Field>Storage: ?</Field>
          <Field>Version: ?</Field>
          {settings.history_ledgers.map((ledger, i) => {
            const timestamp = moment(Number(ledger.timestamp) / 10 ** 6).format(
              'DD-MM-YY HH:mm:SS',
            );

            return (
              <Field key={String(i)}>
                <Text>Ledger #{i}</Text>
                {ledger.records.map((r, j) => (
                  <Field key={r.toString()}>
                    Record #{j}: {r.toString()}
                  </Field>
                ))}

                <Field>Timestamp: {timestamp}</Field>
              </Field>
            );
          })}
        </>
      )}
    </Container>
  );
};
