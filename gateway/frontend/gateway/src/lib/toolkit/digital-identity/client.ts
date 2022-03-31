import { AnonymousIdentity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { generateIdentity } from './ed25519';
import { Identity, JsonnableEd25519KeyIdentity } from './types';

const IDENTITY_LOCAL_STORAGE_KEY = 'digital-identity';

export class DigitalIdentityClient {
  private identity: Identity = new AnonymousIdentity();

  constructor(identity?: Ed25519KeyIdentity) {
    if (identity) {
      this.setIdentity(identity);
    } else {
      this.restoreIdentity();
    }
  }

  public getIdentity = (): Identity => this.identity;

  public isAuthenticated = () => !this.identity.getPrincipal().isAnonymous();

  public login = (mnemonic: string) => {
    const identity = generateIdentity(mnemonic);

    this.setIdentity(identity);
  };

  public logout = () => {
    this.identity = new AnonymousIdentity();
    localStorage.removeItem(IDENTITY_LOCAL_STORAGE_KEY);
  };

  private setIdentity = (identity: Ed25519KeyIdentity) => {
    this.identity = identity;

    const serializedIdentity = JSON.stringify(identity.toJSON());

    localStorage.setItem(IDENTITY_LOCAL_STORAGE_KEY, serializedIdentity);
  };

  private restoreIdentity = () => {
    const str = localStorage.getItem(IDENTITY_LOCAL_STORAGE_KEY) || '';

    if (!str) {
      return;
    }

    let jsonIdentity: JsonnableEd25519KeyIdentity | null = null;

    try {
      jsonIdentity = JSON.parse(str);

      if (!Array.isArray(jsonIdentity)) {
        console.warn('Saved identity from localStorage is not Array');
        return;
      }

      const identity = Ed25519KeyIdentity.fromParsedJson(jsonIdentity);

      this.identity = identity;
    } catch (e) {
      console.warn('Unable to parse identity from localStorage', e);
    }
  };
}
