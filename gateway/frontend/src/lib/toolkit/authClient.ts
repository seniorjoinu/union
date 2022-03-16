import { HttpAgent, HttpAgentOptions, Identity } from '@dfinity/agent';
import { DigitalIdentityClient } from './digital-identity';
import * as mobx from 'mobx';
import { getAgent, getHttpAgentOptions } from './agent';

export class AuthClientWrapper {
  private _principal: Principal | null = null;
  private options: HttpAgentOptions = getHttpAgentOptions();
  public authClient?: DigitalIdentityClient;
  public agent: HttpAgent = new HttpAgent(this.options);
  public ready = false;
  public authentificated = false;

  constructor() {
    mobx.makeObservable(this, {
      agent: mobx.observable,
      ready: mobx.observable,
      authentificated: mobx.observable,
      // @ts-expect-error
      _principal: mobx.observable,
      principal: mobx.computed,
      create: mobx.action,
      login: mobx.action,
      logout: mobx.action,
    });

    console.warn('CREATE AGENT', this.options, this.agent);
    this.initializeAgent(); 
  }

  get principal() {
    return this._principal;
  }

  // Create a new auth client and update it's ready state
  async create() {
    this.authClient = new DigitalIdentityClient();
    await this.initializeAgent();
    this.authentificated = this.authClient?.isAuthenticated();
    this._principal = this.authClient?.getIdentity().getPrincipal() || null;
    this.ready = true;
  }

  login = async (mnemonic: string): Promise<Identity | undefined> => {
    console.log('[AuthClientWrapper] try to login');
    this.authClient?.login(mnemonic);

    const identity = this.authClient?.getIdentity();
    this._principal = identity?.getPrincipal() || null;
    await this.initializeAgent(); 
    return identity;
  }

  logout = async () => {
    console.log('[AuthClientWrapper] logout');
    await this.authClient?.logout();
    // await this.authClient?.logout({ returnTo: '/' });
    this._principal = this.authClient?.getIdentity().getPrincipal() || null;
    await this.initializeAgent(); 
  }

  getIdentity = async () => {
    return this.authClient?.getIdentity();
  }

  isAuthentificated = async () => {
    return this.authClient?.isAuthenticated();
  }

  private initializeAgent = async () => {
    const identity = await this.authClient?.getIdentity();
    this.agent = await getAgent({ identity });
  };
}

// TODO пока что это синглтон, наверно это неправильно
// На изменения в этом инстансе завязан canister/controller, он реагирует на авторизацию
// FIXME придумать более изящное решение
export const authClient = (window as any).authClient = new AuthClientWrapper();

/**
 * @dfinity/agent requires this. Can be removed once it's fixed
 // FIXME КОСТЫЛИ
 */
import {Principal} from '@dfinity/principal';
import './polyfill';
(window as any).ic = authClient;
