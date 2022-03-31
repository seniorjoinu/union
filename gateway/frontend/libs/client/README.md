# Union wallet client

## Quickstart

- deploy gateway frontend locally
- get frontend gateway canisterId. This will be `gateway`
- start `yarn dev`

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
```
