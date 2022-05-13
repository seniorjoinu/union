import React, { useCallback, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { PageWrapper, Text, SubmitButton as SB, ImageFile as IF } from '@union/components';
import { useDeployer, useUnion } from 'services';
import { NavLink } from 'react-router-dom';
import { Principal } from '@dfinity/principal';
import moment from 'moment';
import { useCurrentUnion } from '../context';

const ImageFile = styled(IF)``;
const Field = styled(Text)``;
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
  const deployer = useDeployer(process.env.UNION_DEPLOYER_CANISTER_ID);

  useEffect(() => {
    canister.get_settings();
    deployer.canister.get_instances({ ids: [Principal.from(principal)] });
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
          <Field>Version: {deployer.data.get_instances?.instances[0].binary_version || '?'}</Field>
          {settings.history_ledgers.map((ledger, i) => {
            const timestamp = moment(Number(ledger.timestamp) / 10 ** 6).format(
              'DD-MM-YY HH:mm:SS',
            );

            return (
              <Field key={String(i)}>
                <Field>Ledger #{i}</Field>
                {ledger.records.map((r, j) => (
                  <Field key={r.toString()}>
                    Record #{j}: {r.toString()}
                  </Field>
                ))}

                <Field>Timestamp: {timestamp}</Field>
              </Field>
            );
          })}
          {/* <Field>Balance: ?</Field>
          <Field>Storage: ?</Field> */}
        </>
      )}
    </Container>
  );
};
