import { Principal } from '@dfinity/principal';
import { HttpAgent, HttpAgentOptions, Identity } from '@dfinity/agent';
import { AuthClient, AuthClientCreateOptions, AuthClientLoginOptions } from '@dfinity/auth-client';
import { getAgent, getHttpAgentOptions } from './agent';

export type LoginOptions = Omit<AuthClientLoginOptions, 'onSuccess'>;

export class AuthClientWrapper {
  public principal: Principal | null = null;
  protected options: HttpAgentOptions = getHttpAgentOptions();
  public authClient?: AuthClient;
  public agent: HttpAgent = new HttpAgent(this.options);
  public ready = false;
  public authentificated = false;

  async create(opts?: AuthClientCreateOptions) {
    this.authClient = await AuthClient.create(opts);
    await this.initializeAgent(opts);
    this.authentificated = await this.authClient?.isAuthenticated();
    this.principal = this.authClient?.getIdentity().getPrincipal() || null;
    this.ready = true;
  }

  login = async (options?: LoginOptions): Promise<Identity | undefined> => {
    return new Promise(async (resolve) => {
      await this.authClient?.login({
        ...options,
        onSuccess: async () => {
          const identity = this.authClient?.getIdentity();
          this.principal = identity?.getPrincipal() || null;
          await this.initializeAgent();
          resolve(identity);
        },
      });
    });
  };

  logout = async () => {
    console.log('[AuthClientWrapper] logout');
    await this.authClient?.logout();
    // await this.authClient?.logout({ returnTo: '/' });
    this.principal = this.authClient?.getIdentity().getPrincipal() || null;
    await this.initializeAgent();
  };

  getIdentity = async () => {
    return this.authClient?.getIdentity();
  };

  isAuthentificated = async () => {
    return await (this.authClient?.isAuthenticated() || false);
  };

  private initializeAgent = async (opts?: AuthClientCreateOptions) => {
    const identity = opts?.identity || (await this.authClient?.getIdentity());
    this.agent = await getAgent({ ...opts, identity });
  };
}

export const authClient = ((window as any).authClient = new AuthClientWrapper());

/**
 * @dfinity/agent requires this. Can be removed once it's fixed
 // FIXME КОСТЫЛИ
 */
(window as any).ic = authClient;
