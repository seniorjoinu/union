#!/usr/bin/env bash
set -e
. ./utils.sh
source $root_folder/.env

args=
log "[batches-send] Sending batches..."
operations=""
for i in ${!batch_ids[@]}
do
	element="${batch_ids[i]}"
	send_batch_args='(record {
		batch_id = '$element';
		target_canister = '${frontend_canister_id_did//\"/\\\"}'
	})'
	operations+="
		record {
			endpoint = record {
				canister_id = principal \"${root_union}\";
				method_name = \"send_batch\";
			};
			cycles = 0 : nat64;
			args = variant {
				CandidString = vec {
					\"${send_batch_args}\"
				}	: vec text
			}
		};
	"
done

send_batches_args="(record {
	title = \"Send batches to frontend canister\";
	description = \"Send first assets to frontend canister\";
	rnp = record { role_id = 1 : nat32; permission_id = 0 : nat16; };
	authorization_delay_nano = 0 : nat64;
	program = variant {
		RemoteCallSequence = vec {
			${operations}
		}
	}
})"

dfx canister $args call $root_union "execute" "${send_batches_args}"

log "[batches-send] Frontend canister ready"
log "http://$(parse_principal $frontend_canister_id_did).localhost:8000"