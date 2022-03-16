import { HttpAgent, HttpAgentOptions } from '@dfinity/agent';
import { isLocalhost } from './utils';

export const getAgent = async (opts?: HttpAgentOptions) => {
	const options = {
		...getHttpAgentOptions(),
		...opts
	};
	const agent = new HttpAgent(options);

	if (isLocalhost()) {
		console.error('dev mode');
		await agent.fetchRootKey();
	}

	return agent;
};

export const getHttpAgentOptions = (): HttpAgentOptions => (isLocalhost() ? {
	host: 'http://localhost:8000',
} : {});
