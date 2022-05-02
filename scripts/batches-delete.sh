#!/usr/bin/env bash
set -e
. ./utils.sh
source $root_folder/.env

args=
log "[batches-delete] Deleting batches..."
batch_ids_vec=""
for i in ${!batch_ids[@]}
do
	element="${batch_ids[i]}"
	batch_ids_vec+=$element'; '
done

log "[batches-delete] Delete batches ( ${batch_ids_vec} )"

delete_batches_args="(record {
	title = \"Delete locked batches\";
	description = \"Delete locked batches\";
	rnp = record { role_id = 1 : nat32; permission_id = 0 : nat16; };
	authorization_delay_nano = 0 : nat64;
	program = variant {
		RemoteCallSequence = vec {
			record {
				endpoint = record {
					canister_id = principal \"${root_wallet}\";
					method_name = \"delete_batches\";
				};
				cycles = 1 : nat64;
				args = variant {
					CandidString = vec {
						\"(record { batch_ids = vec { ${batch_ids_vec} } })\"
					}	: vec text
				};
			}
		}
	}
})"

dfx canister $args call $root_wallet "execute" "${delete_batches_args}"

log "[batches-delete] Batches deleted"