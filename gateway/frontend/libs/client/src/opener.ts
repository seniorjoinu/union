import { Principal } from '@dfinity/principal';

export type OpenerOptions = {
  after?: 'close';
};
export interface UnionWalletWindowOpenerOptions {
  gateway?: Principal;
  providerUrl?: string;
}

export interface OpenProps<R = any, P = any> {
  path: string;
  payload?: P | null;
  options?: OpenerOptions;
  handleResponse?(data: R): void;
}

export interface MessageData {
  origin: string;
  target: string;
  type: string;
  payload: any;
  options: OpenerOptions;
}

interface Cache<R, P> {
  payload: P | null;
  options: OpenerOptions;
  handleResponse?(data: R): void;
}

const hostname = new URL(window.location.origin).hostname;
const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');
export class UnionWalletWindowOpener {
  protected options: Required<UnionWalletWindowOpenerOptions>;
  protected window: Window | null = null;
  protected interval: number | null = null;
  private cache: Cache<any, any> | null = null;

  constructor(opts: UnionWalletWindowOpenerOptions) {
    this.options = {
      gateway: Principal.fromText(GATEWAY_FRONTEND_CANISTER_ID),
      providerUrl: isLocalhost ? 'http://localhost:8000' : 'https://ic0.app',
      ...opts,
    };
  }

  view = (path: string) => this.openWindow(path);

  open = <R, P = any>({ path, payload, handleResponse, options = {} }: OpenProps<R, P>) => {
    window.removeEventListener('message', this.messageHandler);

    this.openWindow(path, true);

    this.cache = { payload: payload || null, options, handleResponse };
    window.addEventListener('message', this.messageHandler);
  };

  private openWindow = (path: string, waitClose?: boolean) => {
    if (this.window) {
      this.window.close();
      this.window = null;
    }

    const url = this.buildURL();
    url.pathname = '/auth';
    url.searchParams.append('to', path);

    this.window = window.open(url.toString(), '_blank');
    if (this.interval != null) {
      window.clearInterval(this.interval);
    }

    if (waitClose) {
      this.interval = window.setInterval(this.checkChild, 1000);
    }

    return this.window;
  };

  private checkChild = () => {
    if (!this.window || this.window?.closed) {
      this.clear();
    }
  };

  private clear = () => {
    this.cache = null;
    window.removeEventListener('message', this.messageHandler);
    if (this.interval !== null) {
      window.clearInterval(this.interval);
    }
  };

  private buildURL = () => {
    const canisterId = this.options.gateway.toString();
    const url = new URL(this.options.providerUrl);

    url.host = `${canisterId}.${url.host}`;

    return url;
  };

  private messageHandler = (e: MessageEvent<MessageData>) => {
    if (!e.data || e.data.target != 'union-wallet-client' || e.data.origin != 'union-wallet') {
      return;
    }

    switch (e.data.type) {
      case 'ready': {
        if (!this.cache?.handleResponse) {
          window.removeEventListener('message', this.messageHandler);
        }
        this.sendData();
        if (!this.cache?.handleResponse) {
          this.cache = null;
        }
        break;
      }
      case 'done': {
        if (this.cache?.handleResponse) {
          this.cache.handleResponse(e.data.payload);
        }
        this.window = null;
        window.removeEventListener('message', this.messageHandler);
      }
    }
  };

  private sendData = () => {
    if (!this.cache || !this.window) {
      return;
    }

    const url = this.buildURL();
    const data: MessageData = {
      target: 'union-wallet',
      origin: 'union-wallet-client',
      type: 'send-data',
      payload: this.cache.payload,
      options: this.cache.options,
    };
    this.window.postMessage(data, url.toString());
  };
}
