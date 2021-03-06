#!/usr/bin/env bash
set -e
. ./utils.sh
. $ROOT_FOLDER/.env

log TODO
# frontend_wasm_path="${ROOT_FOLDER}/gateway/frontend/.dfx/local/canisters/union-frontend/union-frontend.wasm"

# rm ./install_code_execute_args.txt 2> /dev/null || echo ""
# rm ./candid_string.txt 2> /dev/null || echo ""

# log "[frontend-install-wasm] Upload wasm to frontend canister"
# wasm_bytes=$(./uc did encode --mode blob $frontend_wasm_path)

# candid_string='(record {
# 	wasm_module = blob "'$wasm_bytes'";
# 	canister_id = '$frontend_canister_id_did';
# 	mode = variant { install };
# 	arg = vec {} : vec nat8
# })'
# echo "$candid_string" > ./candid_string.txt
# candid_string_bytes=$(./uc did encode --mode content ./candid_string.txt)

# install_code_args='(record {
# 	title = "Install code to canister";
# 	description = "Install code and set current union as controller";
# 	rnp = record { role_id = 1 : nat32; permission_id = 0 : nat16; };
# 	authorization_delay_nano = 0 : nat64;
# 	program = variant {
# 		RemoteCallSequence = vec {
# 			record {
# 				endpoint = record {
# 					canister_id = principal "aaaaa-aa";
# 					method_name = "install_code";
# 				};
# 				cycles = 0 : nat64;
# 				args = variant {
# 					Encoded = blob "'$candid_string_bytes'"
# 				}
# 			}
# 		}
# 	}
# })'
# echo "$install_code_args" > ./install_code_execute_args.txt

# log "[frontend-install-wasm]" $(./uc canister $root_union "execute" ./install_code_execute_args.txt)

# rm ./install_code_execute_args.txt 2> /dev/null || echo ""
# rm ./candid_string.txt 2> /dev/null || echo ""

# sleep 3

# log "[frontend-install-wasm] Getting history entry..."

# get_history_entry_ids_response=$(dfx canister call --query $root_union get_history_entry_ids "()")
# last_history_id=$(./uc did get "${get_history_entry_ids_response}" "0.ids.#max")

# log "[frontend-install-wasm]" last_history_id = $last_history_id
# get_history_entries_response=$(
# 	dfx canister call --query $root_union get_history_entries "(record { ids = vec { ${last_history_id} } })"
# )
# ok_result_string=$(
# 	./uc did get "${get_history_entries_response}" "0.entries.0.entry_type.Executed.1.0.Ok"
# )
# eval "ok_result=${ok_result_string}"