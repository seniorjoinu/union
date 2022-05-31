import { Principal } from '@dfinity/principal';
import { Text, Accordeon, Field, Chips, Row, Pager } from '@union/components';
import React, { useEffect, useRef } from 'react';
import { useUnion } from 'services';
import styled from 'styled-components';
import { caseByCount } from 'toolkit';
import { Group, Shares } from 'union-ts';
import { useCurrentUnion } from '../context';
import { ProfileInfo } from '../Profile';

const Children = styled(Row)`
  flex-grow: 1;
  justify-content: flex-end;
`;

const Head = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px 0;

  & > *:not(:last-child) {
    margin-bottom: 8px;
  }
`;

export interface GroupItemProps {
  className?: string;
  style?: React.CSSProperties;
  group: Group;
  opened?: boolean;
  children?: React.ReactNode;
  acceptedAdornment?: React.ReactNode;
  unacceptedAdornment?: React.ReactNode;
}

export const GroupItem = styled(
  ({ group, opened, children, acceptedAdornment, unacceptedAdornment, ...p }: GroupItemProps) => {
    const ref = useRef<HTMLElement>(null);
    const { principal } = useCurrentUnion();
    const { canister, data, fetching } = useUnion(principal);

    useEffect(() => {
      canister.get_total_group_shares({ group_id: group.id[0]!, query_delegation_proof_opt: [] });

      if (!opened || !ref.current) {
        return;
      }
      ref.current.scrollIntoView({ behavior: 'smooth' }); // FIXME shift with header height
    }, []);

    return (
      <Accordeon
        ref={ref}
        title={
          <Head>
            <Text variant='h5'>{group.name}</Text>
          </Head>
        }
        isDefaultOpened={opened}
        {...p}
      >
        <Container>
          <Row>
            {group.private && <Chips variant='p3'>private</Chips>}
            {!fetching.get_total_group_shares && (
              <Chips variant='p3'>total shares {String(data.get_total_group_shares?.total)}</Chips>
            )}
            <Children>{children}</Children>
          </Row>
          <Field variant={{ value: 'p3' }}>{group.description}</Field>

          <Pager
            size={5}
            buttonVariant='caption'
            title={
              <Row>
                <Text variant='p3' weight='medium'>
                  Active shareholders
                </Text>
                {acceptedAdornment}
              </Row>
            }
            renderIfEmpty={false}
            fetch={({ index, size }) =>
              canister.list_group_shares({
                page_req: {
                  page_index: index,
                  page_size: size,
                  filter: null,
                  sort: null,
                },
                group_id: group.id[0]!,
                query_delegation_proof_opt: [],
              })
            }
            verbose={{ zeroscreen: null }}
            renderItem={([principal, shares]: [Principal, Shares]) => (
              <ProfileInfo
                variant='p3'
                profileId={principal}
                chips={[
                  `${String(shares)} ${caseByCount(parseInt(String(shares)), [
                    'share',
                    'shares',
                    'shares',
                  ])}`,
                ]}
              />
            )}
          />
          <Pager
            size={5}
            buttonVariant='caption'
            title={
              <Row>
                <Text variant='p3' weight='medium'>
                  Unaccepted shareholders
                </Text>
                {unacceptedAdornment}
              </Row>
            }
            renderIfEmpty={false}
            fetch={({ index, size }) =>
              canister.list_unaccepted_group_shares({
                page_req: {
                  page_index: index,
                  page_size: size,
                  filter: null,
                  sort: null,
                },
                group_id: group.id[0]!,
                query_delegation_proof_opt: [],
              })
            }
            verbose={{ zeroscreen: null }}
            renderItem={([principal, shares]: [Principal, Shares]) =>
              (shares ? (
                <ProfileInfo
                  variant='p3'
                  profileId={principal}
                  chips={[
                    `${String(shares)} ${caseByCount(parseInt(String(shares)), [
                      'share',
                      'shares',
                      'shares',
                    ])}`,
                  ]}
                />
              ) : null)
            }
          />
        </Container>
      </Accordeon>
    );
  },
)``;
