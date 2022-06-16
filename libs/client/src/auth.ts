import { Principal } from '@dfinity/principal';
import { UnionWindowOpener, UnionWindowOpenerOptions } from './opener';
import {
  GetMyQueryDelegationProofRequest,
  QueryDelegationProof,
  _SERVICE,
} from './assets/union-wallet.did';
// @ts-expect-error
import { idlFactory as idl } from './assets/union-wallet.did.js';
import { OpenerOptions, AuthData, Proof } from './types';
import { buildDecoder } from '@union/serialize';

export interface UnionWindowAuthorizerOptions extends UnionWindowOpenerOptions {}

export interface LoginProps {
  principal: Principal;
  request?: GetMyQueryDelegationProofRequest;
}

export type AuthorizationStatus = false | 'authorized' | 'delegated';

const STORAGE_KEY = 'union-data';
export class UnionWindowAuthorizer {
  protected options: UnionWindowAuthorizerOptions;
  protected opener: UnionWindowOpener;
  protected data: AuthData | null;

  constructor(opts: UnionWindowAuthorizerOptions) {
    this.data = this.restore();
    this.options = opts;
    this.opener = new UnionWindowOpener(opts);
  }

  get proof(): Proof | null {
    return this.data?.proof || null;
  }

  getProof = () => {
    let proof: QueryDelegationProof | null = null;
    if (Array.isArray(this.data?.proof) && typeof this.data?.proof[0] == 'number') {
      try {
        const decoder = buildDecoder<_SERVICE>(idl, 'retTypes');
        const decoded = decoder.get_my_query_delegation_proof(
          new Uint8Array(this.data.proof).buffer,
        );

        proof = decoded[0]?.proof || null;
      } catch (e) {
        console.error('Unable to parse proof', e);
      }
    }
    console.log('Decoded proof', proof);
    return proof;
  };

  get profile(): Principal | null {
    return this.data?.profile ? Principal.from(this.data?.profile) : null;
  }

  get union(): Principal | null {
    return checkPrincipal(this.data?.union);
  }

  isAuthorized = (): AuthorizationStatus => {
    if (this.data?.union && this.data.proof) {
      return 'delegated';
    }
    if (this.data?.union || this.data?.profile) {
      return 'authorized';
    }
    return false;
  };

  login = ({ principal, request }: LoginProps, opts?: OpenerOptions) => {
    return new Promise<Proof | null>((resolve, reject) => {
      const timeout = setTimeout(() => reject('Time is over'), 5 * 60 * 1000);

      this.opener.open({
        path: `/wallets/authorize`,
        payload: { principal, request },
        options: { after: 'close', ...opts },
        handleResponse: async (data) => {
          if (timeout) {
            clearTimeout(timeout);
          }
          this.data = await parseData(data);
          this.store();
          resolve(this.proof);
        },
      });
    });
  };

  logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    this.data = null;
  };

  private store = () => {
    if (!this.data) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  };

  private restore = () => {
    let data: any | null = null;
    try {
      data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch (e) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parseData(data);
  };
}

const parseData = (data: any): AuthData | null => {
  if (!data) {
    return null;
  }

  return {
    profile: data.profile ? String(data.profile) : null,
    proof: data.proof && Array.isArray(data.proof) ? data.proof : null,
    union: typeof data.union == 'string' ? data.union : null,
  };
};

const checkPrincipal = (canisterId: string | Principal | undefined | null): Principal | null => {
  let principal: Principal;

  try {
    principal = Principal.from(canisterId);
  } catch (e) {
    return null;
  }

  if (!principal._isPrincipal || principal.isAnonymous()) {
    return null;
  }

  return principal;
};
