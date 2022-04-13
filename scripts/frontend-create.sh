#!/usr/bin/env bash
set -e
. ./scripts/log.sh

log "Deployer: Create frontend canister"
create_canister_args='(record {})'

execute_result=$(dfx canister $args call $root_wallet "execute" "(record {
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
				cycles = 1 : nat64;
				args = variant {
					CandidString = vec {
						\"(record {})\"
					}	: vec text
				};
			}
		}
	}
})")

log execute_result=$execute_result

log "Wait for canister creation 10s"
sleep 10

log "Getting history entry..."

get_history_entry_ids_response=$(dfx canister call --query $root_wallet get_history_entry_ids "()")
last_history_id=$(./scripts/uwc did get "${get_history_entry_ids_response}" "0.ids.#max")

# TODO compare last_history_id and execute_result

log last_history_id = $last_history_id
get_history_entries_response=$(
	dfx canister call --query $root_wallet get_history_entries "(record { ids = vec { ${last_history_id} } })"
)
ok_result_string=$(
	./scripts/uwc did get "${get_history_entries_response}" "0.entries.0.entry_type.Executed.1.0.Ok"
)
eval "ok_result=${ok_result_string}"
deployed_principal_did=$(./scripts/uwc did get "${ok_result}" "0.canister_id")
frontend_canister_id_did=${deployed_principal_did//\"/\\\"}
log frontend_canister_id_did = $frontend_canister_id_did


rm ./scripts/install_code_execute_args.txt || echo ""
log "Deployer: Upload wasm to frontend canister"
wasm_bytes=$(
	./scripts/uwc did encode --mode file ./gateway/frontend/gateway/.dfx/local/canisters/union-wallet-frontend/union-wallet-frontend.wasm
)

candid_string='(record { wasm_module = blob \"'$wasm_bytes'\"; canister_id = '$frontend_canister_id_did'; mode = variant { install }; arg = vec {} : vec nat8 })'

install_code_args="(record {
	title = \"Install code to canister\";
	description = \"Install code and set current wallet as controller\";
	rnp = record { role_id = 1 : nat32; permission_id = 0 : nat16; };
	authorization_delay_nano = 0 : nat64;
	program = variant {
		RemoteCallSequence = vec {
			record {
				endpoint = record {
					canister_id = principal \"aaaaa-aa\";
					method_name = \"install_code\";
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

echo $install_code_args > ./scripts/install_code_execute_args.txt

log $(./scripts/uwc canister $root_wallet "execute" ./scripts/install_code_execute_args.txt)

rm ./scripts/install_code_execute_args.txt

export frontend_canister_id_did