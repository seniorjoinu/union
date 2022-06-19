# Union caller utility

A helper utility that allows you to work with large arguments. It reads arguments from files and allows you to encode / decode and send requests to the replica.

## Examples

```shell
# encode wasm file as blob
wasm_bytes=$(./uc did encode --mode blob ./test.wasm)
```

```shell
# get prop from candid response
response='(record { id = 1 : nat64; test = record { test_key = "some text" } })'
test_key=$(./uc did get "${response}" "0.test.test_key")

```

```shell
# encode large payload
args='(record {
	id = principal "aaaaa-aa";
	name = "some name";
	description = "SOME LARGE DESCRIPTION > 1.3mb";
})'
echo "$args" > ./args.txt
args_bytes=$(./uc did encode --mode content ./args.txt)
```

```shell
# install code through management canister
# encode wasm
wasm_bytes=$(./uc did encode --mode blob ./certified_assets.wasm)

# make payload with wasm blob and encode
candid_string='(record {
	wasm_module = blob "'$wasm_bytes'";
	canister_id = principal "'$frontend_canister_id'";
	mode = variant { install };
	arg = vec {} : vec nat8
})'
echo "$candid_string" > ./candid_string.txt

# call management canister with large payload
./uc canister "aaaaa-aa" "install_code" ./candid_string.txt
```
