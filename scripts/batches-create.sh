#!/usr/bin/env bash
set -e
. ./utils.sh
source .env

args=
folder_path="${root_folder}/gateway/frontend/gateway/dist"
log "[batches-create] Creating batches..."

files=`cd $folder_path && find . -type f`
rm ./create_chunk_execute_args.txt || echo ""

batch_ids=()
exportable_batch_ids="( "
for eachfile in $files
do
	key=${eachfile/\./}
	filepath="${folder_path}${key}"
	content_type=$(
		if [[ $filepath == *.js ]]; then
			echo "application/javascript"
		else 
			file -b --mime-type $filepath
		fi
	)
	log $key $content_type

	create_batch_response=$(
		dfx canister $args call $root_wallet "create_batch" "(record {
			key = \"${key}\";
			content_type = \"${content_type}\";
		})"
	)

	batch_id_did=$(./uwc did get "${create_batch_response}" "0.batch_id")
	echo batch_id = $batch_id_did
	eval "batch_id_did=${batch_id_did}"

	file_bytes=$(./uwc did encode --mode blob $filepath)

	create_chunk_args='(record {
		batch_id = '$batch_id_did';
		content = blob "'$file_bytes'";
	})'
	echo "$create_chunk_args" > ./create_chunk_execute_args.txt

	create_chunk_response=$(
		./uwc canister $root_wallet "create_chunk" ./create_chunk_execute_args.txt
	)

	eval "create_chunk_response=${create_chunk_response}"

	chunk_id_did=$(./uwc did get "${create_chunk_response}" "0.chunk_id")
	echo chunk_id = $chunk_id_did

	lock_batches_response=$(
		dfx canister $args call $root_wallet "lock_batches" "(record {
			batch_ids = vec { ${batch_id_did} };
		})"
	)

	echo lock batches response = $lock_batches_response
	echo ""

	batch_ids+=("${batch_id_did}")
	exportable_batch_ids+='"'$batch_id_did'" '
done

log "[batches-create] Batches successfull uploaded and locked"
rm ./create_chunk_execute_args.txt

exportable_batch_ids+=")"
export batch_ids
export exportable_batch_ids