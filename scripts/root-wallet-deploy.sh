#!/usr/bin/env bash
set -e
. ./scripts/log.sh

args=
# TODO uncomment in future - for using `./setup.sh --network ic`
# args=$@

log "Deploy root wallet through gateway_backend..."
spawn_result=$(dfx canister $args call $gateway_backend "controller_spawn_wallet" "(record { version = \"0.0.0\"; wallet_creator = principal \"${identity}\" })")
echo spawn_result=$spawn_result
root_wallet=$(echo $spawn_result | grep -Eo 'principal \"(\w|-)+\"' | grep -Eo '\"(\w|-)+\"' | grep -Eo '(\w|-)+')

COLOR="92"
log root_wallet=$root_wallet
log spawn_result=$spawn_result
COLOR="96"
export root_wallet
