import React from 'react';
import { RemoteCallArgs } from 'union-ts';
import { get } from 'react-hook-form';
import { Principal } from '@dfinity/principal';
import { checkPrincipal } from 'toolkit';
import { ViewerSettings } from '../../IDLRenderer';
import { CandidEncodedArgs } from './Candid';

export const getRules = (): ViewerSettings<any>['rules'] => ({
  'RemoteCallSequence.-1.args': {
    adornment: {
      kind: 'replace',
      render: (ctx, path, name, origin) => {
        const args = get(ctx.value, path) as RemoteCallArgs;
        const canisterId = get(
          ctx.value,
          path.replace('.args', '.endpoint.canister_id'),
        ) as Principal;
        const methodName = get(ctx.value, path.replace('.args', '.endpoint.method_name')) as string;

        if (!canisterId || !checkPrincipal(canisterId) || !methodName) {
          return <>{origin}</>;
        }

        return <CandidEncodedArgs args={args} canisterId={canisterId} methodName={methodName} />;
      },
    },
  },
  // TODO move another generic rules: permissionInfo, groupInfo, ....
});
