# Union wallet client

Client library for union-wallet interaction. Start storybook with `yarn dev` and try to create execution in union-wallet

## Quickstart

- deploy gateway frontend locally
- get frontend gateway canisterId. This will be `gateway` option
- deploy wallet through gateway and get wallet-canister-id. This will be `wallet` option
- start `yarn dev`, open storybook frontend
- Paste `gateway` and `wallet` in `Actions` tab
- Make calls by buttons

For more info check [storybook](./src/stories/index.stories.tsx).

## Usage

```
import { UnionWalletClient } from '@union-wallet/client';
import { Principal } from '@dfinity/principal';

const client = new UnionWalletClient({
	gateway: Principal.fromText('...'),
	wallet: Principal.fromText('...'),
	providerUrl: 'http://localhost:3000', // optional for local dev development
});

client.execute(
	{
		title: 'Title',
		description: 'Description',
		authorization_delay_nano: BigInt(0),
		program: { Empty: null },
	},
	{ after: 'close' },
);

// this will opens union-gateway frontend with prefilled execution command
```

## Publishing

Need to publish and test this package
