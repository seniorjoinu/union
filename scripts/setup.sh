#!/usr/bin/env bash
set -e

# Target control schema
#
# Gateway backend
#1 # controller = root_wallet
#2 # inner controller = root_wallet
#
# Gateway frontend
#3 # controller = root_wallet
#4 # authorized controller = root_wallet - TODO need PR for `deauthorize` method on certified_asset canister
#
# Deployer
#5 # controller = 'aaaaa-aa'
#6 # spawn controller = gateway_backend
#7 # binary controller = root_wallet
#
# Root wallet
#8 # controller = deployer

COLOR="96"
function log {
	C="\033[0;${COLOR}m"
	NC='\033[0m' # No Color

	echo -e "${C}$@${NC}"
}

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

log "#6 Setup deployer spawn control to gateway_backend..."
dfx canister $args call $deployer "transfer_spawn_control" "(record { new_controller = principal \"${gateway_backend}\" })"

log "Deploy root wallet through gateway_backend..."
spawn_result=$(dfx canister $args call $gateway_backend "controller_spawn_wallet" "(record { version = \"0.0.0\"; wallet_creator = principal \"${identity}\" })")
echo spawn_result=$spawn_result
root_wallet=$(echo $spawn_result | grep -Eo 'principal \"(\w|-)+\"' | grep -Eo '\"(\w|-)+\"' | grep -Eo '(\w|-)+')
COLOR="92"
log root_wallet=$root_wallet
COLOR="96"

log "#7 Setup deployer binary control to root_wallet..."
dfx canister $args call $deployer "transfer_binary_control" "(record { new_controller = principal \"${root_wallet}\" })"

log "#2 Setup gateway control to root_wallet..."
dfx canister $args call $gateway_backend "transfer_control" "(record { new_controller = principal \"${root_wallet}\" })"

log "#1 Setup gateway_backend canister controllers..."
cd gateway/backend
dfx canister $args update-settings "$gateway_backend" --controller "$root_wallet"
cd ../..

log "#5 Setup deployer canister controllers..."
cd deployer-backend
dfx canister $args update-settings "$deployer" --controller "aaaaa-aa"
cd ../

log "#3 Setup gateway_frontend canister controllers..."
cd gateway/frontend/gateway
dfx canister $args update-settings "$gateway_frontend" --controller "$root_wallet"
cd ../../../

log "#8 root_wallet already has deployer as canister controller."


COLOR="92"
log root_wallet=$root_wallet
log spawn_result=$spawn_result

# TODO transfer control of root wallet to deployer

# TODO transfer frontend control (authorization and controller) to root-wallet
# and make asset updating through root-wallet
# echo "Setup gateway frontend control"

# TODO release first wallet-wasm version
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
