#!/usr/bin/env bash
set -e
. ./utils.sh
source $ROOT_FOLDER/.env

# Target control schema
#
# Gateway backend
#1 # controller = root_union
#2 # inner controller = root_union
#
# Gateway frontend
#3 # controller = root_union
#4 # authorized controller = root_union - TODO need PR for `deauthorize` method on certified_asset canister
#
# Deployer
#5 # controller = 'aaaaa-aa'
#6 # spawn controller = gateway_backend
#7 # binary controller = root_union
#
# Root union
#8 # controller = deployer

args=
# TODO uncomment in future - for using `./setup.sh --network ic`
# args=$@

log "[infra-setup] #6 Setup deployer spawn control to gateway_backend..."
dfx canister $args call $deployer "transfer_spawn_control" "(record { new_controller = principal \"${gateway_backend}\" })"
