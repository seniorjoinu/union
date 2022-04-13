#!/usr/bin/env bash
set -e
. ./scripts/log.sh

# Target control schema
#
# Gateway backend
#1 # controller = root_wallet
#2 # inner controller = root_wallet
#
# Gateway frontend
#3 # controller = root_wallet
#4 # authorized controller = root_wallet - TODO need PR for `deauthorize` method on certified_asset canister
#
# Deployer
#5 # controller = 'aaaaa-aa'
#6 # spawn controller = gateway_backend
#7 # binary controller = root_wallet
#
# Root wallet
#8 # controller = deployer

args=
# TODO uncomment in future - for using `./setup.sh --network ic`
# args=$@

log "#6 Setup deployer spawn control to gateway_backend..."
dfx canister $args call $deployer "transfer_spawn_control" "(record { new_controller = principal \"${gateway_backend}\" })"

source ./scripts/root-wallet-deploy.sh

log "#7 Setup deployer binary control to root_wallet..."
dfx canister $args call $deployer "transfer_binary_control" "(record { new_controller = principal \"${root_wallet}\" })"

log "#2 Setup gateway control to root_wallet..."
dfx canister $args call $gateway_backend "transfer_control" "(record { new_controller = principal \"${root_wallet}\" })"

log "#1 Setup gateway_backend canister controllers..."
cd gateway/backend
dfx canister $args update-settings "$gateway_backend" --controller "$root_wallet"
cd ../..

log "#5 Setup deployer canister controllers..."
cd deployer-backend
dfx canister $args update-settings "$deployer" --controller "aaaaa-aa"
cd ../

log "#8 root_wallet already has deployer as canister controller."

export root_wallet
