import { useCallback, useState } from 'react';
import { authClient, Canister, CanisterProps, useCanister } from 'toolkit';
import { buildSerializer, buildEncoder, buildDecoder } from '@union/serialize';
import { AccessConfig, VotingConfig, _SERVICE } from 'union-ts';
// @ts-expect-error
import { idlFactory as idl } from 'union-idl';
import { Principal } from '@dfinity/principal';
import { IDL } from '@dfinity/candid';

export type { _SERVICE } from 'union-ts';

export type IUnionController = Canister<_SERVICE>;

export const unionIdl = idl as IDL.InterfaceFactory;

export const initUnionController = (canisterId: string, handlers?: CanisterProps['handlers']) => {
  const canister = ((window as any).union = new Canister<_SERVICE>({
    canisterId,
    idl,
    handlers,
    agent: authClient.agent,
  }));

  return canister;
};

export const useUnion = <S = _SERVICE>(canisterId: Principal) => {
  const [methodAccess, setMethodAccess] = useState<Record<keyof S, AccessConfig[]>>(
    {} as Record<keyof S, AccessConfig[]>,
  );
  const canister = useCanister(canisterId.toString(), initUnionController);

  const getMethodAccess = useCallback(
    async (p: Omit<GetMethodAccessConfigProps, 'canister'>) => {
      const access = await getMethodAccessConfig({
        canister: canister.canister,
        ...p,
      });
      const mappedAccess = access.reduce(
        (acc, next) => ({ ...acc, [next.methodName]: next.accessConfigs }),
        {} as Record<string, AccessConfig[]>,
      );
      setMethodAccess((access) => ({ ...access, ...mappedAccess }));

      return access;
    },
    [canister.canister, setMethodAccess, canisterId],
  );

  return { ...canister, getMethodAccess, methodAccess };
};

export interface GetMethodAccessConfigProps {
  canister: _SERVICE;
  program: {
    methodName: string;
    canisterId: Principal;
  }[];
  profile: Principal;
}

const getMethodAccessConfig = async ({
  canister,
  program,
  profile,
}: GetMethodAccessConfigProps) => {
  const { groups } = await canister.get_my_groups();
  const myGroupShares = await Promise.all(
    groups.map(async (g) => {
      const { balance } = await canister.get_my_group_shares_balance({ group_id: g.id[0]! });
      return { id: String(g.id[0]!), balance };
    }),
  );
  const groupShares = myGroupShares.reduce(
    (acc, next) => ({ ...acc, [next.id]: next.balance }),
    {} as Record<string, bigint>,
  );

  return await Promise.all(
    program.map(async ({ canisterId, methodName }) => {
      const {
        page: { data: permissions },
      } = await canister.list_permissions({
        page_req: {
          page_index: 0,
          page_size: 100, // FIXME resolve paging
          sort: null,
          filter: { target: [{ Endpoint: { canister_id: canisterId, method_name: methodName } }] },
        },
        query_delegation_proof_opt: [],
      });

      // TODO optimize
      let accessConfigs: AccessConfig[] = [];
      for (const permission of permissions) {
        if (typeof permission.id[0] == 'undefined') {
          continue;
        }

        const {
          page: { data },
        } = await canister.list_access_configs({
          page_req: {
            page_index: 0,
            page_size: 100, // FIXME
            sort: null,
            filter: {
              permission: [permission.id[0]],
              group: [],
              profile: [],
            },
          },
          query_delegation_proof_opt: [],
        });

        const configs = data.filter(
          (ac) =>
            !!ac.allowees.find((al) => {
              if ('Everyone' in al) {
                return true;
              } else if ('Group' in al) {
                const groupShare = groupShares[String(al.Group.id)];
                return typeof groupShare !== 'undefined' && groupShare >= al.Group.min_shares;
              } else {
                return al.Profile.toString() == profile.toString();
              }
            }),
        );

        if (!!configs.length) {
          accessConfigs = data;
          break;
        }
      }

      return { canisterId, methodName, accessConfigs };
    }),
  );
};

export const getMethodAccessVotingConfig = async ({
  canister,
  program,
}: Omit<GetMethodAccessConfigProps, 'profile'>) => {
  return await Promise.all(
    program.map(async ({ canisterId, methodName }) => {
      const {
        page: { data: permissions },
      } = await canister.list_permissions({
        page_req: {
          page_index: 0,
          page_size: 100, // FIXME resolve paging
          sort: null,
          filter: { target: [{ Endpoint: { canister_id: canisterId, method_name: methodName } }] },
        },
        query_delegation_proof_opt: [],
      });

      // TODO optimize
      let votingConfigs: VotingConfig[] = [];
      for (const permission of permissions) {
        if (typeof permission.id[0] == 'undefined') {
          continue;
        }

        const {
          page: { data },
        } = await canister.list_voting_configs({
          page_req: {
            page_index: 0,
            page_size: 10,
            sort: null,
            filter: {
              permission: [permission.id[0]],
              group: [],
            },
          },
          query_delegation_proof_opt: [],
        });
        if (!!data.length) {
          votingConfigs = data;
          break;
        }
      }

      return { canisterId, methodName, votingConfigs };
    }),
  );
};

export const unionSerializer = buildSerializer<_SERVICE>(idl);

export const unionEncoder = buildEncoder<_SERVICE>(idl);

export const unionDecoder = buildDecoder<_SERVICE>(idl);
