#!/usr/bin/env bash
set -e

echo "Deployer: Create canister"

cd ./scripts/util/
bash ./build.sh
cd ../../

# title: 'Create canister',
#       description: 'Create canister with management canister',
#       rnp,
#       program: [
#         {
#           endpoint: {
#             canister_id: process.env.MANAGEMENT_CANISTER_ID,
#             method_name: 'create_canister',
#           },
#           cycles: String(10 ** 9),
#           args_candid: managementSerializer.create_canister({ settings: [] }),
#         },
#       ],

echo "Deployer: Create frontend canister"
create_canister_args='(record {})'
dfx canister $args call $root_wallet "execute" "(record {
	title = \"Create canister\";
	description = \"Create canister with management canister\";
	rnp = record { role_id = 1 : nat32; permission_id = 0 : nat16; };
	authorization_delay_nano = 0 : nat64;
	program = variant {
		RemoteCallSequence = vec {
			record {
				endpoint = record {
					canister_id = principal \"aaaaa-aa\";
					method_name = \"create_canister\";
				};
				cycles = 1000000000000 : nat64;
				args = variant {
					CandidString = vec {
						\"(record {})\"
					}	: vec text
				};
			}
		}
	}
})"

# rm ./scripts/execute_args.txt || echo ""

# echo "Deployer: Upload binary of wallet"
# wallet_wasm_bytes=$(
# 	./scripts/uwc did --mode file ./wallet-backend/target/wasm32-unknown-unknown/release/union-wallet-opt.wasm
# )

# candid_string='(record { version = \"'$version'\"; binary = blob \"'$wallet_wasm_bytes'\" })'

# upload_binary_args="(record {
# 	title = \"Upload first version of wallet\";
# 	description = \"Upload first version of wallet for deploy\";
# 	rnp = record { role_id = 1 : nat32; permission_id = 0 : nat16; };
# 	authorization_delay_nano = 0 : nat64;
# 	program = variant {
# 		RemoteCallSequence = vec {
# 			record {
# 				endpoint = record {
# 					canister_id = principal \"${deployer}\";
# 					method_name = \"upload_binary\";
# 				};
# 				cycles = 0 : nat64;
# 				args = variant {
# 					CandidString = vec {
#  						\"${candid_string}\"
#  					}	: vec text
# 				}
# 			}
# 		}
# 	}
# })"

# echo $upload_binary_args > ./scripts/execute_args.txt

# ./scripts/uwc canister $root_wallet "execute" ./scripts/execute_args.txt

# rm ./scripts/execute_args.txt

# echo "Deployer: Release first version of wallet"
# release_binary_version_args='(record { version = \"'$version'\" })'
# dfx canister $args call $root_wallet "execute" "(record {
# 	title = \"Release first version of wallet\";
# 	description = \"Release first version of wallet for deploy\";
# 	rnp = record { role_id = 1 : nat32; permission_id = 0 : nat16; };
# 	authorization_delay_nano = 0 : nat64;
# 	program = variant {
# 		RemoteCallSequence = vec {
# 			record {
# 				endpoint = record {
# 					canister_id = principal \"${deployer}\";
# 					method_name = \"release_binary_version\";
# 				};
# 				cycles = 0 : nat64;
# 				args = variant {
# 					CandidString = vec {
# 						\"${release_binary_version_args}\"
# 					}	: vec text
# 				};
# 			}
# 		}
# 	}
# })"
