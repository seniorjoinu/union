#!/usr/bin/env bash
set -e

echo "Deployer: Upload binary of wallet"
version="0.0.1"

cd ./scripts/util/
bash ./build.sh
cd ../../

echo "Deployer: Create first version of wallet"
create_binary_version_args='(record { version = \"'$version'\"; description = \"Initial version\" })'
dfx canister $args call $root_wallet "execute" "(record {
	title = \"Create first version of wallet\";
	description = \"Create first version of wallet for deploy\";
	rnp = record { role_id = 1 : nat32; permission_id = 0 : nat16; };
	authorization_delay_nano = 0 : nat64;
	program = variant {
		RemoteCallSequence = vec {
			record {
				endpoint = record {
					canister_id = principal \"${deployer}\";
					method_name = \"create_binary_version\";
				};
				cycles = 0 : nat64;
				args = variant {
					CandidString = vec {
						\"${create_binary_version_args}\"
					}	: vec text
				};
			}
		}
	}
})"

rm ./scripts/execute_args.txt || echo ""

echo "Deployer: Upload binary of wallet"
wallet_wasm_bytes=$(
	./scripts/uwc did --mode file ./wallet-backend/target/wasm32-unknown-unknown/release/union-wallet-opt.wasm
)

candid_string='(record { version = \"'$version'\"; binary = blob \"'$wallet_wasm_bytes'\" })'

upload_binary_args="(record {
	title = \"Upload first version of wallet\";
	description = \"Upload first version of wallet for deploy\";
	rnp = record { role_id = 1 : nat32; permission_id = 0 : nat16; };
	authorization_delay_nano = 0 : nat64;
	program = variant {
		RemoteCallSequence = vec {
			record {
				endpoint = record {
					canister_id = principal \"${deployer}\";
					method_name = \"upload_binary\";
				};
				cycles = 0 : nat64;
				args = variant {
					CandidString = vec {
 						\"${candid_string}\"
 					}	: vec text
				}
			}
		}
	}
})"

echo $upload_binary_args > ./scripts/execute_args.txt

./scripts/uwc canister $root_wallet "execute" ./scripts/execute_args.txt

rm ./scripts/execute_args.txt

echo "Deployer: Release first version of wallet"
release_binary_version_args='(record { version = \"'$version'\" })'
dfx canister $args call $root_wallet "execute" "(record {
	title = \"Release first version of wallet\";
	description = \"Release first version of wallet for deploy\";
	rnp = record { role_id = 1 : nat32; permission_id = 0 : nat16; };
	authorization_delay_nano = 0 : nat64;
	program = variant {
		RemoteCallSequence = vec {
			record {
				endpoint = record {
					canister_id = principal \"${deployer}\";
					method_name = \"release_binary_version\";
				};
				cycles = 0 : nat64;
				args = variant {
					CandidString = vec {
						\"${release_binary_version_args}\"
					}	: vec text
				};
			}
		}
	}
})"
