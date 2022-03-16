import { isLocalhost } from 'toolkit';

export const config = {
	LOCAL_IDENTITY_URL: 'http://localhost:8000?canisterId=rwlgt-iiaaa-aaaaa-aaaaa-cai',
	IDENTITY_URL: 'https://identity.ic0.app',
};

export const getIdentityUrl = () => (isLocalhost() ? config.LOCAL_IDENTITY_URL : config.IDENTITY_URL);
