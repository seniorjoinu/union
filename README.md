# Union

Sovereign organizations software

```shell
dfx deploy union-wallet --argument '(principal "6xqad-ivesr-pbpu5-3g5ka-3piah-uvuk2-buwfp-enqaa-p64lr-y7sdi-sqe")'

dfx canister call union-wallet get_my_roles '()'

dfx canister call union-wallet get_my_permissions '()'

dfx canister call union-wallet execute '(record { title = "Add new role"; description = "Test"; authorization_delay_nano = 100 : nat64; rnp = record { role_id = 1 : nat32; permission_id = 0 : nat16 }; program = variant { RemoteCallSequence = vec { record { endpoint = record { canister_id = principal "rrkah-fqaaa-aaaaa-aaaaq-cai"; method_name = "create_role" }; cycles = 0 : nat64; args_candid = vec { "record { role_type = variant { Profile = record { principal_id = principal \"aaaaa-aa\"; name = \"Test\"; description = \"Test role\" } } }" } : vec text } } : vec record { endpoint : record { canister_id : principal; method_name : text; }; args_candid : vec text; cycles : nat64 } } })'

dfx canister call union-wallet get_history_entries '(record { ids = vec { 0 }; rnp = record { role_id = 1 : nat32; permission_id = 0 : nat16 } })'

dfx canister call union-wallet get_roles '(record { ids = vec { 3 } : vec nat32; rnp = record { role_id = 1 : nat32; permission_id = 0 : nat16 } })'
```

## Quickstart

```
dfx start --clean
./scripts/deploy.sh

./scripts/setup.sh

# Register via Internet Identity and get principal on frontend gateway
./scripts/add-profile.sh *identity*
```

## didc

```
curl -fsSL https://github.com/dfinity/candid/releases/download/2022-03-30/didc-macos > ./didc
chmod -R 777 ./didc
```
