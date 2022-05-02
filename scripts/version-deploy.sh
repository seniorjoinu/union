#!/usr/bin/env bash
set -e
. ./utils.sh
source $root_folder/.env

# TODO get version and wasm_path args 
version="0.0.0"
wallet_wasm_path="${root_folder}/wallet-backend/target/wasm32-unknown-unknown/release/union-wallet-opt.wasm"

log "[version-deploy] Create first version of wallet"
create_binary_version_args='(record { version = "'$version'"; description = "Initial version" })'
dfx canister $args call $deployer "create_binary_version" "${create_binary_version_args}"

rm ./candid_string.txt 2> /dev/null || echo ""

log "[version-deploy] encoding wasm"
wallet_wasm_bytes=$(./uwc did encode --mode blob $wallet_wasm_path)
log "[version-deploy] encoding payload"
candid_string='(record {
	version = "'$version'";
	binary = blob "'$wallet_wasm_bytes'"
})'
echo "$candid_string" > ./candid_string.txt

./uwc canister $deployer "upload_binary" ./candid_string.txt

rm ./candid_string.txt 2> /dev/null

log "[version-deploy] Release first version of wallet"
release_binary_version_args='(record { version = "'$version'" })'
dfx canister $args call $deployer "release_binary_version" "${release_binary_version_args}"
