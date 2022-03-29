import React from 'react';
import styled from 'styled-components';
import { Text, Button as B } from 'components';
import { useTrigger } from 'toolkit';
import { NavLink as N } from 'react-router-dom';
import { useWallet } from '../../../services';
import { useCurrentWallet } from '../context';
import { Item as I } from './Item';

const Title = styled(Text)``;
const Button = styled(B)``;
const Item = styled(I)``;
const NavLink = styled(N)``;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: 32px;

  ${Title} {
    margin-bottom: 64px;
  }
  ${NavLink} {
    text-decoration: none;
  }
  ${NavLink}:not(:last-child) {
    margin-bottom: 24px;
  }
  ${Button} {
    align-self: flex-end;
  }
`;

export interface HistoryProps extends IClassName {
  createLink?: string;
}

export function History({ createLink, ...p }: HistoryProps) {
  const { rnp, principal } = useCurrentWallet();
  const { canister, fetching, data } = useWallet(principal);

  useTrigger(
    (rnp) => {
      canister
        .get_history_entry_ids({ rnp })
        .then(({ ids }) => canister.get_history_entries({ rnp, ids }));
    },
    rnp,
    [canister],
  );

  const progress = !!fetching.get_history_entry_ids || !!fetching.get_history_entries;
  const entries = data.get_history_entries?.entries || [];

  return (
    <Container {...p}>
      <Title variant='h2'>История произвольных вызовов</Title>
      {!!createLink && !!rnp && (
        <Button forwardedAs={NavLink} to={createLink}>
          + Создать произвольный вызов
        </Button>
      )}
      {progress && <span>Fetching...</span>}
      {!progress && !entries.length && <span>История пуста</span>}
      {entries.map((entry) => (
        <NavLink key={String(entry.id)} to={String(entry.id)}>
          <Item entry={entry} />
        </NavLink>
      ))}
    </Container>
  );
}
