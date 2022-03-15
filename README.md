# Union
Sovereign organizations software

```
dfx canister call union-wallet execute '(record { title = "Add new role"; description = "Test"; authorization_delay_nano = 100 : nat64; rnp = record { role_id = 1 : nat32; permission_id = 0 : nat16 }; program = variant { RemoteCallSequence = vec { record { endpoint = record { canister_id = principal "rrkah-fqaaa-aaaaa-aaaaq-cai"; method_name = "create_role" }; cycles = 0 : nat64; args_candid = vec { "record { role_type = variant { Profile = record { principal_id = principal \"aaaaa-aa\"; name = \"Test\"; description = \"Test role\" } } }" } : vec text } } : vec record { endpoint : record { canister_id : principal; method_name : text; }; args_candid : vec text; cycles : nat64 } } })'
```