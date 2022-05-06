# Union serialize

Universal library for serializing arguments

## Usage

```
import { buildSerializer } from '@union/serialize';
import { _SERVICE } from './canister.did'; // _SERVICE contains function "echo" with args (message: string, count: number)
import { idlFactory as idl } from './canister.did.js';

const canisterSerializer = buildSerializer<_SERVICE>(idl);

const serializedArguments: string[] = canisterSerializer.echo("some text", 10);

console.log(serializedArguments);

// Will prints
// ( message = "" : text; count = 10 : Nat )
```

## Code assumptions

- Used monkey-patching of @dfinity/candid in [file](./src/idl-monkey-patching.ts)
