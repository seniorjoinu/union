import { useCallback, useState } from 'react';
import { authClient, Canister, CanisterProps, useCanister } from 'toolkit';
import { buildSerializer, buildEncoder, buildDecoder } from '@union/serialize';
import { AccessConfig, _SERVICE } from 'union-ts';
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
      const accessConfigs = await getMethodAccessConfig({
        canister: canister.canister,
        ...p,
      });
      setMethodAccess((access) => ({ ...access, [p.methodName]: accessConfigs }));
      return accessConfigs;
    },
    [canister.canister, setMethodAccess, canisterId],
  );

  return { ...canister, getMethodAccess, methodAccess };
};

export interface GetMethodAccessConfigProps {
  canister: _SERVICE;
  methodName: string;
  canisterId: Principal;
  profile: Principal;
}

const getMethodAccessConfig = async ({
  canister,
  methodName,
  canisterId,
  profile,
}: GetMethodAccessConfigProps) => {
  const {
    page: { data: permissions },
  } = await canister.list_permissions({
    page_req: {
      page_index: 0,
      page_size: 100, // FIXME resolve paging
      sort: null,
      filter: { target: [{ Endpoint: { canister_id: canisterId, method_name: methodName } }] },
    },
  });

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
        page_size: 10,
        sort: null,
        filter: {
          permission: [permission.id[0]],
          group: [],
          profile: [profile],
        },
      },
    });
    if (!!data.length) {
      accessConfigs = data;
      break;
    }
  }

  return accessConfigs;
};

export const unionSerializer = buildSerializer<_SERVICE>(idl);

export const unionEncoder = buildEncoder<_SERVICE>(idl);

export const unionDecoder = buildDecoder<_SERVICE>(idl);
