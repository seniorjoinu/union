#!/usr/bin/env bash
set -e
. ./utils.sh
source .env

log "Start deploy infrastructure"

args=""
wallet="--wallet=$(dfx identity get-wallet)"
# TODO uncomment in future for using `./deploy.sh --network ic`
# args=$@

if [ -z "$args" ]
then
	log "[infra-deploy] Local deploy"

	log "[infra-deploy] Deploy Internet Identity"
	cd $root_folder
	git clone git@github.com:dfinity/internet-identity.git || (echo "Internet identity exists. Pulling" && cd ./internet-identity && git pull && cd ../)
	cd ./internet-identity
	rm -rf ./.dfx 2> /dev/null || echo ""
	npm i
	II_FETCH_ROOT_KEY=1 II_DUMMY_CAPTCHA=1 II_DUMMY_AUTH=1 dfx deploy --no-wallet --argument '(null)'
	dfx canister call internet_identity init_salt
	INTERNET_IDENTITY_CANISTER_ID=$(dfx canister id internet_identity)
	cd $current_folder
fi

log "[infra-deploy] Build root wallet..."
cd "${root_folder}/wallet-backend"
rm -rf ./.dfx/local 2> /dev/null || echo ""
dfx build --all --check
log "[infra-deploy] Root wallet built"

log "[infra-deploy] Deploy deployer..."
cd "${root_folder}/deployer-backend/canister"
rm -rf ./.dfx/local 2> /dev/null || echo ""
dfx deploy $wallet $args --argument "(principal \"${identity}\", principal \"${identity}\")"
deployer=$(dfx canister $args id union-deployer)
log "[infra-deploy] Deployer deployed"

log "[infra-deploy] Deploy gateway backend..."
cd "${root_folder}/gateway/backend"
rm -rf ./.dfx/local 2> /dev/null || echo ""
dfx deploy $wallet $args --argument "(principal \"${identity}\", principal \"${deployer}\")"
gateway_backend=$(dfx canister $args id gateway)
log "[infra-deploy] Gateway backend deployed"

log "[infra-deploy] Building frontend..."
cd "${root_folder}/gateway/frontend/gateway"
rm -rf ./.dfx/local 2> /dev/null || echo ""
yarn
dfx build --all --check
log "[infra-deploy] Frontend built"

COLOR="92"
log deployer=$deployer
log gateway_backend=$gateway_backend
log internet-identity="http://localhost:8000?canisterId=$INTERNET_IDENTITY_CANISTER_ID"

cd $current_folder

export deployer
export gateway_backend