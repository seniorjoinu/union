#!/usr/bin/env bash
set -e
. ./utils.sh
source $root_folder/.env

log "[frontend-create] Create frontend canister"
create_canister_args='(record {})'

execute_result=$(dfx canister $args call $root_union "execute" "(record {
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

log "[frontend-create] Waiting for canister creation 10s..."
sleep 3

log "[frontend-create] Getting history entry..."

get_history_entry_ids_response=$(dfx canister call --query $root_union get_history_entry_ids "()")
last_history_id=$(./uc did get "${get_history_entry_ids_response}" "0.ids.#max")

# TODO compare last_history_id and execute_result

log "[frontend-create]" last_history_id = $last_history_id
get_history_entries_response=$(
	dfx canister call --query $root_union get_history_entries "(record { ids = vec { ${last_history_id} } })"
)
ok_result_string=$(
	./uc did get "${get_history_entries_response}" "0.entries.0.entry_type.Executed.1.0.Ok"
)
eval "ok_result=${ok_result_string}"
deployed_principal_did=$(./uc did get "${ok_result}" "0.canister_id")
frontend_canister_id_did=$deployed_principal_did
log "[frontend-create]" frontend_canister_id_did = $frontend_canister_id_did

export frontend_canister_id_did