#!/usr/bin/env bash
set -e
. ./utils.sh
source .env

args=
version="0.0.0"
# TODO uncomment in future - for using `./setup.sh --network ic`
# args=$@

log "[root-wallet-deploy] Deploy root wallet through gateway_backend..."
payload="(record { version = \"${version}\"; wallet_creator = principal \"${identity}\" })"
spawn_result=$(
	dfx canister $args call $gateway_backend "controller_spawn_wallet" "${payload}"
)
echo spawn_result=$spawn_result
echo spawn_result=$spawn_result
echo spawn_result=$spawn_result
echo parse_principal = $(parse_principal $spawn_result)
root_wallet=$(echo $spawn_result | grep -Eo 'principal \"(\w|-)+\"' | grep -Eo '\"(\w|-)+\"' | grep -Eo '(\w|-)+')

COLOR="92"
log root_wallet=$root_wallet
log spawn_result=$spawn_result
COLOR="96"
export root_wallet
