import { HttpAgent, HttpAgentOptions } from '@dfinity/agent';

export const config = {
  LOCAL_IDENTITY_URL: `http://localhost:8000?canisterId=${process.env.INTERNET_IDENTITY_CANISTER_ID}`,
  IDENTITY_URL: 'https://identity.ic0.app',
};

export const getAgent = (options: HttpAgentOptions = {}) => {
  const agent = new HttpAgent(options);

  if (isLocalhost()) {
    console.error('dev mode');
    agent.fetchRootKey();
  }

  return agent;
};

export const getIdentityUrl = () =>
  isLocalhost() ? config.LOCAL_IDENTITY_URL : config.IDENTITY_URL;

export const isLocalhost = () =>
  window.location.href.includes('localhost') || window.location.href.includes('127.0.0.1');
