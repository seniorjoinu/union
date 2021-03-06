#!/usr/bin/env bash
set -e
. ./utils.sh
. $ROOT_FOLDER/.env

log "Start deploy infrastructure"

args=""
wallet="--wallet=$(dfx identity get-wallet)"
# TODO uncomment in future for using `./deploy.sh --network ic`
# args=$@

if [ -z "$args" ]
then
	log "[infra-deploy] Local deploy"

	log "[infra-deploy] Deploy Internet Identity"
	cd $ROOT_FOLDER
	git clone git@github.com:dfinity/internet-identity.git || (echo "Internet identity exists. Pulling" && cd ./internet-identity && git pull && cd ../)
	cd ./internet-identity
	rm -rf ./.dfx 2> /dev/null || echo ""
	npm i
	II_FETCH_ROOT_KEY=1 II_DUMMY_CAPTCHA=1 II_DUMMY_AUTH=1 dfx deploy --no-wallet --argument '(null)'
	dfx canister call internet_identity init_salt
	INTERNET_IDENTITY_CANISTER_ID=$(dfx canister id internet_identity)
	cd $CURRENT_FOLDER
fi

log "[infra-deploy] Build history ledger..."
cd "${ROOT_FOLDER}/history-ledger/canister"
rm -rf ./.dfx/local 2> /dev/null || echo ""
dfx build --all --check
log "[infra-deploy] History ledger built"

log "[infra-deploy] Build root union..."
cd "${ROOT_FOLDER}/wallet-backend"
rm -rf ./.dfx/local 2> /dev/null || echo ""
dfx build --all --check
log "[infra-deploy] Root union built"

log "[infra-deploy] Deploy deployer..."
cd "${ROOT_FOLDER}/deployer-backend/canister"
rm -rf ./.dfx/local 2> /dev/null || echo ""
dfx deploy $wallet $args --argument "(principal \"${identity}\", principal \"${identity}\")"
deployer=$(dfx canister $args id union-deployer)
log "[infra-deploy] Deployer deployed"

log "[infra-deploy] Deploy gateway backend..."
cd "${ROOT_FOLDER}/gateway/backend"
rm -rf ./.dfx/local 2> /dev/null || echo ""
dfx deploy $wallet $args --argument "(principal \"${identity}\", principal \"${deployer}\")"
gateway_backend=$(dfx canister $args id gateway)
log "[infra-deploy] Gateway backend deployed"

log "[infra-deploy] Building frontend..."
cd "${ROOT_FOLDER}/gateway/frontend"
rm -rf ./.dfx/local 2> /dev/null || echo ""
yarn
dfx build --all --check
log "[infra-deploy] Frontend built"

COLOR="92"
log deployer=$deployer
log gateway_backend=$gateway_backend
log internet-identity="http://$INTERNET_IDENTITY_CANISTER_ID.localhost:8000"

cd $CURRENT_FOLDER

export deployer
export gateway_backend