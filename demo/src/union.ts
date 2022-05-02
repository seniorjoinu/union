import { useCallback, useEffect, useState } from 'react';
import { getAgent } from './agent';

import { UnionWalletClient } from '@union-wallet/client';

export const unionWalletClient = new UnionWalletClient({
  providerUrl: 'http://localhost:3000',
});

export const useUnionWallet = () => {
  const [authorized, setAuthorized] = useState(false);

  const refresh = useCallback(() => {
    setAuthorized(unionWalletClient.isAuthorized());
  }, [setAuthorized]);

  useEffect(() => {
    refresh();
  }, []);

  return {
    authorized,
    refresh,
    client: unionWalletClient,
    canister: unionWalletClient.getWalletActor(getAgent()),
  };
};
