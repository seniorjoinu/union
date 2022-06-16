#!/usr/bin/env bash
set -e
. ./utils.sh
. $ROOT_FOLDER/.env

args=
version="0.0.0"
wallet="--wallet=$(dfx identity get-wallet)"
identity=$(dfx identity get-principal)
union_wasm_path="${ROOT_FOLDER}/wallet-backend/target/wasm32-unknown-unknown/release/union-wallet-opt.wasm"
history_ledger_wasm_path="${ROOT_FOLDER}/history-ledger/canister/target/wasm32-unknown-unknown/release/union-history-ledger-opt.wasm"
# TODO uncomment in future - for using `./setup.sh --network ic`
# args=$@

COLOR="33"
log "WARNING: TODO need deploy root union and ledger with gateway_backend"
COLOR="96"

log "[root-union-deploy] Create history ledger canister"
create_canister_result=$(dfx canister $wallet $args call "aaaaa-aa" "create_canister" "(record {})")
create_canister_parsed_result=$(./uc did get "${create_canister_result}" "0.canister_id")
history_ledger=$(parse_principal $create_canister_parsed_result)
COLOR="92"
log history_ledger=$history_ledger
COLOR="96"

log "[root-union-deploy] Create root union canister"
create_canister_result=$(dfx canister $wallet $args call "aaaaa-aa" "create_canister" "(record {})")
create_canister_parsed_result=$(./uc did get "${create_canister_result}" "0.canister_id")
root_union=$(parse_principal $create_canister_parsed_result)
COLOR="92"
log root_union=$root_union
COLOR="96"


log "[root-union-deploy] Install wasm to root_union"
rm ./install_code_execute_args.txt 2> /dev/null || echo ""
rm ./candid_string.txt 2> /dev/null || echo ""
union_wasm_bytes=$(./uc did encode --mode blob $union_wasm_path)
execute_args=$(./uc did encode --mode=content --type=string '(record {
	union_name = "Acme.it" : text;
	union_description = "We are building a project and promote it on Thoughter" : text;
	wallet_creator = principal "'$identity'";
	history_ledger = principal "'$history_ledger'";
})')
candid_string='(record {
	wasm_module = blob "'$union_wasm_bytes'";
	canister_id = principal "'$root_union'";
	mode = variant { install };
	arg = blob "'$execute_args'"
})'
echo "$candid_string" > ./install_code_execute_args.txt
log "[root-union-deploy] union install response" $(./uc canister --wallet="${wallet}" "aaaaa-aa" "install_code" ./install_code_execute_args.txt)

rm ./install_code_execute_args.txt 2> /dev/null || echo ""
rm ./candid_string.txt 2> /dev/null || echo ""



log "[root-union-deploy] Install wasm to history-ledger"
history_ledger_wasm_bytes=$(./uc did encode --mode blob $history_ledger_wasm_path)
execute_args=$(./uc did encode --mode=content --type=string '(principal "'$root_union'")')
candid_string='(record {
	wasm_module = blob "'$history_ledger_wasm_bytes'";
	canister_id = principal "'$history_ledger'";
	mode = variant { install };
	arg = blob "'$execute_args'"
})'
echo "$candid_string" > ./install_code_execute_args.txt
log "[root-union-deploy] ledger install response" $(./uc canister --wallet="${wallet}" "aaaaa-aa" "install_code" ./install_code_execute_args.txt)

rm ./install_code_execute_args.txt 2> /dev/null || echo ""
rm ./candid_string.txt 2> /dev/null || echo ""

log "[root-union-deploy] Waiting until ledger subscribes to organization events 10s..."
sleep 10


log "[root-union-deploy] Accept current identity shares"
dfx canister $args call $root_union "accept_my_group_shares" "(record { group_id = ${HAS_PROFILE_GROUP_ID} : nat64; qty = 100 : nat })"

# TODO deploy with gateway_backend
# log "[root-union-deploy] Deploy root union through gateway_backend..."
# payload="(record { version = \"${version}\"; wallet_creator = principal \"${identity}\" })"
# spawn_result=$(
# 	dfx canister $args call $gateway_backend "controller_spawn_wallet" "${payload}"
# )
# root_union=$(parse_principal $spawn_result)

export root_union
export history_ledger
