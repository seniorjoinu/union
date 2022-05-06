import { isLocalhost } from 'toolkit';

export const config = {
  LOCAL_IDENTITY_URL: `http://${process.env.INTERNET_IDENTITY_CANISTER_ID}.localhost:8000`,
  IDENTITY_URL: 'https://identity.ic0.app',
};

export const getIdentityUrl = () =>
  isLocalhost() ? config.LOCAL_IDENTITY_URL : config.IDENTITY_URL;
