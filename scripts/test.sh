#!/usr/bin/env bash
set -e
. ./scripts/log.sh
source .env

echo $frontend_canister_id_did
echo $root_wallet

rm ./scripts/install_code_execute_args.txt || echo ""
rm ./scripts/candid_string.txt || echo ""
log "Deployer: Upload wasm to frontend canister"
wasm_bytes=$(
	# ./scripts/uwc did encode --mode blob ./wallet-backend/.dfx/local/canisters/union-wallet/union-wallet.wasm
	./scripts/uwc did encode --mode blob ./gateway/frontend/gateway/.dfx/local/canisters/union-wallet-frontend/union-wallet-frontend.wasm
)

candid_string='(record { wasm_module = blob "DIDL'$wasm_bytes'"; canister_id = '$frontend_canister_id_did'; mode = variant { install }; arg = vec {} : vec nat8 })'
echo $candid_string > ./scripts/candid_string.txt
candid_string_bytes=$(
	./scripts/uwc did encode --mode blob ./scripts/candid_string.txt
)
# candid_string1='(record { canister_id = '$frontend_canister_id_did'; mode = variant { install }; arg = vec {} : vec nat8 })'
# echo $candid_string1

install_code_args='(record {
	title = "Install code to canister";
	description = "Install code and set current wallet as controller";
	rnp = record { role_id = 1 : nat32; permission_id = 0 : nat16; };
	authorization_delay_nano = 0 : nat64;
	program = variant {
		RemoteCallSequence = vec {
			record {
				endpoint = record {
					canister_id = principal "aaaaa-aa";
					method_name = "install_code";
				};
				cycles = 0 : nat64;
				args = variant {
					Encoded = blob "DIDL'$candid_string_bytes'"

				}
			}
		}
	}
})'

sleep 7

echo $install_code_args > ./scripts/install_code_execute_args.txt

./scripts/uwc canister $root_wallet "execute" ./scripts/install_code_execute_args.txt

get_history_entry_ids_response=$(dfx canister call --query $root_wallet get_history_entry_ids "()")
last_history_id=$(./scripts/uwc did get "${get_history_entry_ids_response}" "0.ids.#max")

# TODO compare last_history_id and execute_result

log last_history_id = $last_history_id
get_history_entries_response=$(
	dfx canister call --query $root_wallet get_history_entries "(record { ids = vec { ${last_history_id} } })"
)
echo $get_history_entries_response > ./scripts/res.txt
ok_result_string=$(
	./scripts/uwc did get "${get_history_entries_response}" "0.entries.0.entry_type.Executed.1.0.Ok"
)
eval "ok_result=${ok_result_string}"
deployed_principal_did=$(./scripts/uwc did get "${ok_result}" "0.canister_id")
frontend_canister_id_did=${deployed_principal_did//\"/\\\"}
log frontend_canister_id_did = $frontend_canister_id_did