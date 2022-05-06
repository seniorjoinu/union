#!/usr/bin/env bash
set -e
. ./utils.sh
source $root_folder/.env

args=
version="0.0.0"
# TODO uncomment in future - for using `./setup.sh --network ic`
# args=$@

log "[root-union-deploy] Deploy root union through gateway_backend..."
payload="(record { version = \"${version}\"; wallet_creator = principal \"${identity}\" })"
spawn_result=$(
	dfx canister $args call $gateway_backend "controller_spawn_wallet" "${payload}"
)
root_union=$(parse_principal $spawn_result)

COLOR="92"
log root_union=$root_union
log spawn_result=$spawn_result
COLOR="96"
export root_union
