import { useState, useMemo } from 'react';
import { AuthCanisterController, AuthCanisterControllerProps } from 'toolkit';
import { _SERVICE } from 'wallet-ts';
// @ts-expect-error
import { idlFactory as idl } from 'wallet-idl';

export type IWalletController = AuthCanisterController<_SERVICE>;

export const initWalletController = (canisterId: string, handlers?: AuthCanisterControllerProps['handlers']) => {
	const canister = (window as any).deployer = new AuthCanisterController<_SERVICE>({
		canisterId,
		idl,
		context: { name: 'wallet' },
		handlers
	});

	return canister;
};

export const useWallet = (canisterId: string) => {
	const [fetching, setFetching] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	const canister = useMemo(() => initWalletController(canisterId, {
		onBeforeRequest: () => {
			setFetching(true);
			setError(null);
		},
		onSuccess: () => {
			setFetching(false);
		},
		onError: (_, e) => {
			setFetching(false);
			setError(e);
		},
	}), [setFetching, setError]);

	return {
		fetching,
		error,
		canister,
	};
};
