#!/usr/bin/env bash
set -e

args=
# TODO uncomment in future - for using `./setup.sh --network ic`
# args=$@

identity=$(dfx identity $args get-principal)

cd deployer-backend
deployer=$(dfx canister $args id union-deployer)
cd ../

cd gateway/backend
gateway_backend=$(dfx canister $args id gateway)
cd ../..

cd gateway/frontend/gateway
gateway_frontend=$(dfx canister $args id union-wallet-frontend)
cd ../../../

echo "Setup deployer spawn control"
# spawn-control - гейтвею, binary-control - корневому кошельку.
dfx canister $args call $deployer "transfer_spawn_control" "(record { new_controller = principal \"${gateway_backend}\" })"

echo "Deploy root wallet"
spawn_result=$(dfx canister $args call $gateway_backend "controller_spawn_wallet" "(record { version = \"0.0.0\"; wallet_creator = principal \"${identity}\" })")
echo spawn_result=$spawn_result
root_wallet=$(echo $spawn_result | grep -Eo 'principal \"(\w|-)+\"' | grep -Eo '\"(\w|-)+\"' | grep -Eo '(\w|-)+')

echo root_wallet=$root_wallet

echo "Setup deployer binary control"
# spawn-control - гейтвею, binary-control - корневому кошельку.
dfx canister $args call $deployer "transfer_binary_control" "(record { new_controller = principal \"${root_wallet}\" })"

echo "Setup gateway control"
# control - корневому кошельку
dfx canister $args call $gateway_backend "transfer_control" "(record { new_controller = principal \"${root_wallet}\" })"

# TODO #1 transfer control of root wallet to deployer

# TODO #2 transfer frontend control (authorization and controller) to root-wallet
# and make asset updating through root-wallet
# echo "Setup gateway frontend control"

# TODO #3 release first wallet-wasm version
# echo "Deployer: Create first version of wallet"
# create_binary_version_args='(record { version = \"0.0.1\"; description = \"Initial version\" })'
# dfx canister $args call $root_wallet "execute" "(record {
# 	title = \"Create first version of wallet\";
# 	description = \"Create first version of wallet for deploy\";
# 	rnp = record { role_id = 1 : nat32; permission_id = 0 : nat16; };
# 	authorization_delay_nano = 0 : nat64;
# 	program = variant {
# 		RemoteCallSequence = vec {
# 			record {
# 				endpoint = record {
# 					canister_id = principal \"${deployer}\";
# 					method_name = \"create_binary_version\";
# 				};
# 				cycles = 0 : nat64;
# 				args = variant {
# 					CandidString = vec {
# 						\"${create_binary_version_args}\"
# 					}	: vec text
# 				};
# 			}
# 		}
# 	}
# })"

# echo "Deployer: Upload binary of wallet"
# wallet_wasm_bytes=$(hexdump -v -e '/1 " %3d;"' ./wallet-backend/.dfx/local/canisters/union-wallet/union-wallet.wasm)
# upload_binary_program_args='(record { version = \"0.0.1\"; binary = vec { '${wallet_wasm_bytes}' } })'
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
# 						\"${upload_binary_program_args}\"
# 					}	: vec text};
# 				}
# 			}
# 		}
# 	})"
# dfx canister $args call $root_wallet "execute" $upload_binary_args
# # FIXME Argument list too long

# echo "Deployer: Release first version of wallet"
# release_binary_version_args='(record { version = \"0.0.1\" })'
# dfx canister $args call $root_wallet "execute" "(record {
# 	title = \"Create first version of wallet\";
# 	description = \"Create first version of wallet for deploy\";
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
