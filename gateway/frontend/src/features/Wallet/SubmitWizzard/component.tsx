import React, { useEffect, useMemo } from 'react';
import styled from 'styled-components';
import {
  Button as B,
  Column,
  PageWrapper,
  Row,
  Spinner,
  Text,
  withBorder,
} from '@union/components';
import { MessageData } from '@union/client';
import { NavLink, useNavigate } from 'react-router-dom';
import { Principal } from '@dfinity/principal';
import { useUnion } from 'services';
import { Voting } from 'union-ts';
import { VotingItem } from '../Votings';
import { useRender } from '../../IDLRenderer';

const Controls = styled(Row)`
  justify-content: flex-end;
`;
const Button = styled(B)``;
const Title = styled(Text)``;
const Item = withBorder(
  styled(Column)`
    padding: 8px;
    cursor: pointer;
  `,
  { withQuad: false, hoverColor: 'dark' },
);

const Container = styled(PageWrapper)`
  ${Spinner} {
    margin: 16px;
    align-self: center;
  }

  ${Title} {
    margin: 32px 0;
  }
`;

export interface SubmitWizzardProps {
  className?: string;
  style?: React.CSSProperties;
  data: MessageData | undefined;
  unionId: Principal;
  onSuccess?(): void;
}

export const SubmitWizzard = styled(({ data, unionId, onSuccess, ...p }: SubmitWizzardProps) => {
  const nav = useNavigate();
  const union = useUnion(unionId);
  const { View } = useRender<Voting>({
    canisterId: unionId,
    type: 'Voting',
  });

  useEffect(() => {
    union.canister.list_votings({
      page_req: {
        page_index: 0,
        page_size: 100, // FIXME need filters by status
        sort: { UpdatedAt: false },
        filter: null,
      },
      query_delegation_proof_opt: [],
    });
  }, []);

  const availableVotings = useMemo(
    () =>
      union.data.list_votings?.page.data.filter(
        (v) => 'Round' in v.status && v.status.Round == 0,
      ) || [],
    [union.data.list_votings],
  );

  return (
    <Container {...p} title='What do you want to do?'>
      <Row>
        <Item
          onClick={() =>
            nav(`/wallet/${unionId.toString()}/execution-history/execute`, { state: data || {} })
          }
        >
          <Text variant='h5' weight='medium'>
            Execute
          </Text>
        </Item>
        <Item
          onClick={() =>
            nav(`/wallet/${unionId.toString()}/votings/crud/execute`, { state: data || {} })
          }
        >
          <Text variant='h5' weight='medium'>
            Start random voting
          </Text>
        </Item>
      </Row>
      {!!union.fetching.list_votings && <Spinner size={15} />}
      {!!availableVotings.length && (
        <>
          <Title variant='p1' weight='medium' color='grey'>
            Or select a voting to add choices
          </Title>
          {availableVotings.map((v) => (
            <VotingItem key={String(v.id[0])} unionId={unionId} voting={v} View={View}>
              <Controls>
                <Button
                  forwardedAs={NavLink}
                  to={`/wallet/${unionId.toString()}/votings/crud/choices/${String(v.id[0]!)}`}
                  state={data}
                  variant='caption'
                >
                  Select
                </Button>
              </Controls>
            </VotingItem>
          ))}
        </>
      )}
      {/* <Item onClick={handleExecute}>
        <Text variant='h5' weight='medium'>
          Add
        </Text>
      </Item> */}
    </Container>
  );
})``;
