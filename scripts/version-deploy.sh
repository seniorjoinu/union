#!/usr/bin/env bash
set -e
. ./utils.sh
source $root_folder/.env

# TODO get version and wasm_path args 
version="0.0.0"
wasm_path="${root_folder}/wallet-backend/target/wasm32-unknown-unknown/release/union-wallet-opt.wasm"

log "[version-deploy] Create first version of union"
create_binary_version_args='(record { version = "'$version'"; description = "Initial version" })'
dfx canister $args call $deployer "create_binary_version" "${create_binary_version_args}"

rm ./candid_string.txt 2> /dev/null || echo ""

log "[version-deploy] encoding wasm"
wasm_bytes=$(./uc did encode --mode blob $wasm_path)
log "[version-deploy] encoding payload"
candid_string='(record {
	version = "'$version'";
	binary = blob "'$wasm_bytes'"
})'
echo "$candid_string" > ./candid_string.txt

./uc canister $deployer "upload_binary" ./candid_string.txt

rm ./candid_string.txt 2> /dev/null

log "[version-deploy] Release first version of union"
release_binary_version_args='(record { version = "'$version'" })'
dfx canister $args call $deployer "release_binary_version" "${release_binary_version_args}"
