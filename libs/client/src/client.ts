import { Actor, HttpAgent } from '@dfinity/agent';
import { IDL } from '@dfinity/candid';
import { UnionWindowOpener, UnionWindowOpenerOptions } from './opener';
import { UnionWindowAuthorizer } from './auth';
import { _SERVICE } from './assets/union-wallet.did';
// @ts-expect-error
import { idlFactory as idl } from './assets/union-wallet.did.js';
import { OpenerOptions, MessageData } from './types';

export interface UnionClientOptions extends UnionWindowOpenerOptions {}

export class UnionClient {
  protected options: UnionClientOptions;
  private auth: UnionWindowAuthorizer;

  constructor(opts: UnionClientOptions) {
    this.options = opts;
    this.auth = new UnionWindowAuthorizer(opts);
  }

  get union() {
    return this.auth.union;
  }

  get profile() {
    return this.auth.profile;
  }

  get idl() {
    return idl as IDL.InterfaceFactory;
  }

  isAuthorized = () => this.auth.isAuthorized();

  login = (...args: Parameters<UnionWindowAuthorizer['login']>) => this.auth.login(...args);

  logout = (...args: Parameters<UnionWindowAuthorizer['logout']>) => this.auth.logout(...args);

  view = () => {
    const opener = new UnionWindowOpener(this.options);
    opener.view(this.auth.union ? `/wallet/${this.auth.union.toString()}` : '/wallets');
  };

  execute = (payload: MessageData, options?: OpenerOptions) => {
    if (!this.auth.union) {
      throw 'Not authorized';
    }
    const opener = new UnionWindowOpener(this.options);
    opener.open({
      path: `/wallet/${this.auth.union.toString()}/execution-history/external-execute`,
      payload,
      options,
    });
  };

  createVoting = (payload: MessageData, options?: OpenerOptions) => {
    if (!this.auth.union) {
      throw 'Not authorized';
    }
    const opener = new UnionWindowOpener(this.options);
    opener.open({
      path: `/wallet/${this.auth.union.toString()}/votings/crud/external-execute`,
      payload,
      options,
    });
  };

  // executeDirectly = async (payload: ExecuteRequest, agent: HttpAgent) => {
  //   // TODO call with proof from union to direct execution
  //   // Take it from authorizer
  //   // this.auth.proof;
  //   return this.getActor(agent).execute(payload);
  // };

  getActor = (agent: HttpAgent) => {
    if (!this.auth.union) {
      return null;
    }
    return Actor.createActor<_SERVICE>(idl, { canisterId: this.auth.union, agent });
  };
}
