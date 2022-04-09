import { ExecuteRequest } from './union-wallet.did';
import { Principal } from '@dfinity/principal';

export type ExecuteRequestData = Partial<ExecuteRequest>;
export type ExecuteRequestOptions = {
  after?: 'close';
};

export interface UnionWalletClientOptions {
  gateway: Principal;
  wallet: Principal;
  providerUrl?: string;
}

export class UnionWalletClient {
  protected options: UnionWalletClientOptions;
  private window: Window | null = null;
  private buffer: { req: ExecuteRequestData; opts: ExecuteRequestOptions } | null = null;

  constructor(opts: UnionWalletClientOptions) {
    this.options = opts;
  }

  execute = (req: ExecuteRequestData, opts?: ExecuteRequestOptions) => {
    this.open();

    this.buffer = { req, opts: { ...opts } };
    window.addEventListener('message', this.messageHandler);
  };

  private open = () => {
    const url = this.buildURL();
    url.pathname = '/auth';
    url.searchParams.append('to', `/wallet/${this.options.wallet.toString()}/external-execute`);

    this.window = window.open(url.toString(), '_blank');

    return this.window;
  };

  private buildURL = () => {
    const isLocalhost = ['localhost', '127.0.0.1'].includes(
      new URL(window.location.origin).hostname,
    );

    const canisterId = this.options.gateway.toString();
    const url = new URL(
      this.options.providerUrl || (isLocalhost ? 'http://localhost:8000' : 'https://ic0.app'),
    );

    if (isLocalhost) {
      url.searchParams.append('canisterId', canisterId);
    } else {
      url.host = `${canisterId}.${url.host}`;
    }

    return url;
  };

  private messageHandler = (e: MessageEvent<any>) => {
    if (!e.data || e.data.origin != 'wallet-executor') {
      return;
    }

    switch (e.data.type) {
      case 'ready': {
        window.removeEventListener('message', this.messageHandler);
        this.sendData();
        break;
      }
    }
  };

  private sendData = () => {
    if (!this.buffer || !this.window) {
      return;
    }

    const url = this.buildURL();
    this.window.postMessage(
      {
        target: 'wallet-executor',
        payload: this.buffer.req,
        options: this.buffer.opts,
      },
      url.toString(),
    );
    this.buffer = null;
  };
}
