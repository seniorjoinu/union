#!/usr/bin/env bash
set -e
. ./utils.sh
source .env

# TODO get version and wasm_path args 
version="0.0.1"
wallet_wasm_path="${root_folder}/wallet-backend/target/wasm32-unknown-unknown/release/union-wallet-opt.wasm"

log "[version-deploy] Create first version of wallet"
candind_string='(record { version = \"'$version'\"; description = \"Initial version\" })'
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
						\"${candind_string}\"
					}	: vec text
				};
			}
		}
	}
})"

rm ./upload_binary_execute_args.txt || echo ""
rm ./candid_string.txt || echo ""

log "[version-deploy] encoding wasm"
wallet_wasm_bytes=$(./uwc did encode --mode blob $wallet_wasm_path)

log "[version-deploy] encoding payload"
candid_string='(record {
	version = "'$version'";
	binary = blob "'$wallet_wasm_bytes'"
})'
echo "$candid_string" > ./candid_string.txt
candid_string_bytes=$(./uwc did encode --mode content ./candid_string.txt)

upload_binary_args='(record {
	title = "Upload first version of wallet";
	description = "Upload first version of wallet for deploy";
	rnp = record { role_id = 1 : nat32; permission_id = 0 : nat16; };
	authorization_delay_nano = 0 : nat64;
	program = variant {
		RemoteCallSequence = vec {
			record {
				endpoint = record {
					canister_id = principal "'$deployer'";
					method_name = "upload_binary";
				};
				cycles = 0 : nat64;
				args = variant {
					Encoded = blob "'$candid_string_bytes'"
				}
			}
		}
	}
})'
echo "$upload_binary_args" > ./upload_binary_execute_args.txt

./uwc canister $root_wallet "execute" ./upload_binary_execute_args.txt

rm ./upload_binary_execute_args.txt

log "[version-deploy] Release first version of wallet"
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
