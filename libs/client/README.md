# Union client

Client library for union interaction. Start storybook with `yarn dev` and try to create execution in union

## Quickstart

- deploy infrastructure locally
- `yarn dev`

## Usage

```
import { UnionClient } from '@union/client';
import { Principal } from '@dfinity/principal';

const client = new UnionClient({
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
