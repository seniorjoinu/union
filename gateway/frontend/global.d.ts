declare const process: {
	env: {
		[key: string]: any;
		UNION_WALLET_FRONTEND_CANISTER_ID: string;
		UNION_DEPLOYER_CANISTER_ID: string;
	};
};

declare interface QueryParams {
	mode: 'embed' | undefined;
}

declare const queryParams: QueryParams;

declare type IClassName = {
	className?: string;
	style?: React.CSSProperties;
};
