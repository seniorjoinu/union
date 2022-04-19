#!/usr/bin/env bash
set -e
. ./utils.sh
source .env

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

log "[infra-setup] #6 Setup deployer spawn control to gateway_backend..."
dfx canister $args call $deployer "transfer_spawn_control" "(record { new_controller = principal \"${gateway_backend}\" })"

source ./root-wallet-deploy.sh

log "[infra-setup] #7 Setup deployer binary control to root_wallet..."
dfx canister $args call $deployer "transfer_binary_control" "(record { new_controller = principal \"${root_wallet}\" })"

log "[infra-setup] #2 Setup gateway control to root_wallet..."
dfx canister $args call $gateway_backend "transfer_control" "(record { new_controller = principal \"${root_wallet}\" })"

log "[infra-setup] #1 Setup gateway_backend canister controllers..."
cd "${root_folder}/gateway/backend"
dfx canister $args update-settings "$gateway_backend" --controller "$root_wallet"

log "[infra-setup] #5 Setup deployer canister controllers..."
cd "${root_folder}/deployer-backend"
dfx canister $args update-settings "$deployer" --controller "aaaaa-aa"

log "[infra-setup] #8 root_wallet already has deployer as canister controller."

cd $current_folder
export root_wallet
