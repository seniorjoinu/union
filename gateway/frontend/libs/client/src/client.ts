import { Actor, HttpAgent } from '@dfinity/agent';
import { IDL } from '@dfinity/candid';
import { UnionWalletWindowOpener, OpenerOptions, UnionWalletWindowOpenerOptions } from './opener';
import { UnionWalletWindowAuthorizer } from './auth';
import { ExecuteRequest, _SERVICE } from './union-wallet.did';
// @ts-expect-error
import { idlFactory as idl } from './union-wallet.did.js';

export type ExecuteRequestData = Partial<ExecuteRequest>;

export interface UnionWalletClientOptions extends UnionWalletWindowOpenerOptions {}

export class UnionWalletClient {
  protected options: UnionWalletClientOptions;
  private auth: UnionWalletWindowAuthorizer;

  constructor(opts: UnionWalletClientOptions) {
    this.options = opts;
    this.auth = new UnionWalletWindowAuthorizer(opts);
  }

  get wallet() {
    return this.auth.wallet;
  }

  get idl() {
    return idl as IDL.InterfaceFactory;
  }

  isAuthorized = () => this.auth.isAuthorized();

  login = (...args: Parameters<UnionWalletWindowAuthorizer['login']>) => this.auth.login(...args);

  logout = (...args: Parameters<UnionWalletWindowAuthorizer['logout']>) =>
    this.auth.logout(...args);

  view = () => {
    const opener = new UnionWalletWindowOpener(this.options);
    opener.view(this.auth.wallet ? `/wallet/${this.auth.wallet.toString()}` : '/wallets');
  };

  execute = (payload: ExecuteRequestData, options?: OpenerOptions) => {
    if (!this.auth.wallet) {
      throw 'Not authorized';
    }
    const opener = new UnionWalletWindowOpener(this.options);
    opener.open({
      path: `/wallet/${this.auth.wallet.toString()}/external-execute`,
      payload,
      options,
    });
  };

  // executeDirectly = async (payload: ExecuteRequest, agent: HttpAgent) => {
  //   // TODO call with proof from wallet to direct execution
  //   // Take it from authorizer
  //   // this.auth.proof;
  //   return this.getWalletActor(agent).execute(payload);
  // };

  getWalletActor = (agent: HttpAgent) => {
    if (!this.auth.wallet) {
      return null;
    }
    return Actor.createActor<_SERVICE>(idl, { canisterId: this.auth.wallet, agent });
  };
}
