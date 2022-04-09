import { isLocalhost } from 'toolkit';

export const config = {
  LOCAL_IDENTITY_URL: `http://localhost:8000?canisterId=${process.env.INTERNET_IDENTITY_CANISTER_ID}`,
  IDENTITY_URL: 'https://identity.ic0.app',
};

export const getIdentityUrl = () =>
  isLocalhost() ? config.LOCAL_IDENTITY_URL : config.IDENTITY_URL;
