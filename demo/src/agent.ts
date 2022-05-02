import { HttpAgent, HttpAgentOptions } from '@dfinity/agent';

export const config = {
  LOCAL_IDENTITY_URL: `http://${process.env.INTERNET_IDENTITY_CANISTER_ID}.localhost:8000`,
  IDENTITY_URL: 'https://identity.ic0.app',
};

export const getAgent = (options: HttpAgentOptions = {}) => {
  const agent = new HttpAgent(options);

  if (isLocalhost()) {
    console.warn('dev mode!');
    agent.fetchRootKey();
  }

  return agent;
};

export const getIdentityUrl = () =>
  isLocalhost() ? config.LOCAL_IDENTITY_URL : config.IDENTITY_URL;

export const isLocalhost = () => {
  const hostname = new URL(window.location.origin).hostname;
  return hostname.includes('localhost') || hostname.includes('127.0.0.1');
};
