import { HttpAgent, HttpAgentOptions, Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { DigitalIdentityClient } from './digital-identity';
import { getAgent, getHttpAgentOptions } from './agent';
/**
 * @dfinity/agent requires this. Can be removed once it's fixed
 // FIXME КОСТЫЛИ
 */
import './polyfill';

export class AuthClientWrapper {
  private options: HttpAgentOptions = getHttpAgentOptions();
  public principal: Principal | null = null;
  public authClient?: DigitalIdentityClient;
  public agent: HttpAgent = new HttpAgent(this.options);
  public ready = false;
  public authentificated = false;

  // Create a new auth client and update it's ready state
  async create() {
    this.authClient = new DigitalIdentityClient();
    await this.initializeAgent();
    this.authentificated = this.authClient?.isAuthenticated();
    this.principal = this.authClient?.getIdentity().getPrincipal() || null;
    this.ready = true;
  }

  login = async (mnemonic: string): Promise<Identity | undefined> => {
    this.authClient?.login(mnemonic);

    const identity = this.authClient?.getIdentity();

    this.principal = identity?.getPrincipal() || null;
    await this.initializeAgent();
    return identity;
  };

  logout = async () => {
    await this.authClient?.logout();
    // await this.authClient?.logout({ returnTo: '/' });
    this.principal = this.authClient?.getIdentity().getPrincipal() || null;
    await this.initializeAgent();
  };

  getIdentity = async () => this.authClient?.getIdentity();

  isAuthentificated = async () =>
    this.authClient?.isAuthenticated() &&
    !this.authClient.getIdentity().getPrincipal().isAnonymous();

  private initializeAgent = async () => {
    const identity = await this.authClient?.getIdentity();

    this.agent = await getAgent({ identity });
  };
}

// TODO пока что это синглтон, наверно это неправильно
// На изменения в этом инстансе завязан canister/controller, он реагирует на авторизацию
// FIXME придумать более изящное решение
export const authClient = ((window as any).authClient = new AuthClientWrapper());

(window as any).ic = authClient;
