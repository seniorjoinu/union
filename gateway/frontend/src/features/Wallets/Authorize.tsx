import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Principal } from '@dfinity/principal';
import { useNavigate } from 'react-router-dom';
import { AuthData } from '@union/client';
import {
  PageWrapper,
  Text,
  SubmitButton as B,
  Checkbox,
  Column,
  Accordeon as AC,
  Field,
  Chips,
  Row,
  SimpleListItem,
} from '@union/components';
import { initUnionController, useAuth, useGateway, unionIdl, _SERVICE } from 'services';
import { checkPrincipal } from 'toolkit';
import { GetMyQueryDelegationProofRequest } from 'union-ts';
import { buildEncoder } from '@union/serialize';
import { useClient } from '../useClient';
import { normalizeValues } from '../IDLRenderer';
import { WalletItem } from './WalletItem';

const Accordeon = styled(AC)`
  opacity: ${({ disabled }) => (disabled ? '0.5' : 1)};
`;

const TitleChips = styled(Chips)`
  padding: 2px 8px;
  border-color: ${({ theme }) => theme.colors.dark};
`;

const List = styled.div`
  display: flex;
  flex-direction: column;

  & > *:not(:last-child) {
    margin-bottom: 20px;
  }
`;

const AuthButton = styled(B)``;

const Container = styled(PageWrapper)`
  ${List} {
    margin-top: 16px;
  }
`;

export const AuthorizeWallet = () => {
  const nav = useNavigate();
  const { identity } = useAuth();
  const client = useClient({ parser });
  const [wallets, setWallets] = useState<Principal[]>([]);
  const [opts, setOpts] = useState<{ sharePrincipal: boolean; approveProof: boolean }>({
    sharePrincipal: true,
    approveProof: true,
  });
  const { canister, fetching, data } = useGateway(process.env.GATEWAY_CANISTER_ID);

  useEffect(() => {
    canister.get_controller();
    canister.get_attached_union_wallets().then(({ wallet_ids }) => setWallets(wallet_ids));
  }, []);

  const handleAuth = useCallback(
    async (e: React.MouseEvent, wallet?: Principal) => {
      e.stopPropagation();
      const { request, principal } = client.data || {};

      let proof: number[] | null = null;

      if (wallet && request && request.requested_targets.length && opts.approveProof) {
        const union = initUnionController(wallet.toString());
        const encoder = buildEncoder<_SERVICE>(unionIdl, 'retTypes');

        const response = await union.canister.get_my_query_delegation_proof(request);

        const encoded = encoder.get_my_query_delegation_proof(response);

        proof = Array.from(new Uint8Array(encoded));
      }

      const profile = identity?.getPrincipal().toString() || null;
      // TODO make call to wallet to get proof for principal
      const payload: AuthData = {
        profile: opts.sharePrincipal ? profile : null,
        proof,
        union: wallet?.toString() || null,
      };

      if (!principal) {
        console.error('No principal passed from opener window');
        return;
      }

      await client.success(payload);
    },
    [client.data, client.success, identity, opts],
  );

  const rootWallet = data.get_controller;
  const loading = !!fetching.get_controller || !!fetching.get_attached_union_wallets;

  const targets: Record<string, string[]> = useMemo(
    () =>
      (client.data?.request?.requested_targets
        ? client.data.request.requested_targets.reduce((acc, target) => {
            if ('Endpoint' in target) {
              const key = target.Endpoint.canister_id.toString();
              const ex = acc[key] || [];

              return {
                ...acc,
                [key]: [...ex, target.Endpoint.method_name],
              };
            }
            return { ...acc, '': [] };
          }, {} as Record<string, string[]>)
        : {}),
    [client.data?.request?.requested_targets],
  );

  return (
    <Container title='Authorize with wallet'>
      <Column>
        <Checkbox
          checked={opts.sharePrincipal}
          onChange={() => setOpts((opts) => ({ ...opts, sharePrincipal: !opts.sharePrincipal }))}
        >
          Share current principal
        </Checkbox>
        {
          client.data?.request && !!client.data.request.requested_targets?.length && (
            <>
              <Checkbox
                checked={opts.approveProof}
                onChange={() => setOpts((opts) => ({ ...opts, approveProof: !opts.approveProof }))}
              >
                Approve permissions
              </Checkbox>
              <Accordeon
                title={
                  <Text variant='p3' weight='medium'>
                    Application asks for permissions
                  </Text>
                }
                isDefaultOpened
                disabled={!opts.approveProof}
              >
                {Object.keys(targets).map((canisterId) =>
                  (canisterId ? (
                    <Field
                      key={canisterId}
                      title={
                        <TitleChips variant='p3' color='dark' important>
                          {canisterId}
                        </TitleChips>
                      }
                    >
                      <Row>
                        {targets[canisterId].map((method) => (
                          <Chips key={method} variant='p3'>
                            {method}
                          </Chips>
                        ))}
                      </Row>
                    </Field>
                  ) : (
                    <Field
                      key='empty'
                      title={
                        <TitleChips variant='p3' color='dark' important>
                          Empty program
                        </TitleChips>
                      }
                    />
                  )),
                )}
              </Accordeon>
            </>
          )
          // TODO render target fields
        }
      </Column>
      <List>
        <SimpleListItem
          item={{
            id: '0',
            name: <Text variant='p1'>Without union</Text>,
            children: <AuthButton onClick={(e) => handleAuth(e)}>Authorize</AuthButton>,
          }}
          order={[
            { key: 'name', basis: '50%', align: 'start' },
            { key: 'children', basis: '50%', align: 'end' },
          ]}
        />
        {wallets.map((wallet) => (
          <WalletItem
            key={wallet.toString()}
            rootWallet={rootWallet}
            wallet={wallet}
            onClick={(wallet) => nav(`/wallet/${wallet.toString()}`)}
          >
            <AuthButton onClick={(e) => handleAuth(e, wallet)}>Authorize</AuthButton>
          </WalletItem>
        ))}
        {!wallets.length && !loading && (
          <Text>There are no union wallets. You can create new wallet</Text>
        )}
        {loading && <Text>Fetching...</Text>}
      </List>
    </Container>
  );
};

const parser = (p: any) => {
  if (!p) {
    return null;
  }

  const payload = normalizeValues<any>(p);

  const principal = checkPrincipal(payload.principal);
  const request =
    payload.request &&
    payload.request.requested_targets &&
    Array.isArray(payload.request.requested_targets) &&
    !!payload.request.requested_targets.length &&
    ('SelfEmptyProgram' in payload.request.requested_targets[0] ||
      'Endpoint' in payload.request.requested_targets[0])
      ? (payload.request as GetMyQueryDelegationProofRequest)
      : null;

  return { principal, request };
};
