declare const process: {
  env: {
    [key: string]: any;
    UNION_WALLET_FRONTEND_CANISTER_ID: string;
    UNION_DEPLOYER_CANISTER_ID: string;
    GATEWAY_CANISTER_ID: string;
    INTERNET_IDENTITY_CANISTER_ID: string;
  };
};

declare type IClassName = {
  className?: string;
  style?: React.CSSProperties;
};
