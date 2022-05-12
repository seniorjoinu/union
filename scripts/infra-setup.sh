#!/usr/bin/env bash
set -e
. ./utils.sh
source $ROOT_FOLDER/.env

args=
# TODO uncomment in future - for using `./setup.sh --network ic`
# args=$@

log "[infra-setup] #7 Setup deployer binary control to root_union..."
dfx canister $args call $deployer "transfer_binary_control" "(record { new_controller = principal \"${root_union}\" })"

log "[infra-setup] #2 Setup gateway control to root_union..."
dfx canister $args call $gateway_backend "transfer_control" "(record { new_controller = principal \"${root_union}\" })"

log "[infra-setup] #1 Setup gateway_backend canister controllers..."
cd "${ROOT_FOLDER}/gateway/backend"
dfx canister $args update-settings "$gateway_backend" --controller "$root_union"

log "[infra-setup] #5 Setup deployer canister controllers..."
cd "${ROOT_FOLDER}/deployer-backend/canister"
dfx canister $args update-settings "$deployer" --controller "aaaaa-aa"

log "[infra-setup] #8 root_union already has deployer as canister controller."

cd $CURRENT_FOLDER
