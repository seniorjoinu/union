#!/usr/bin/env bash
set -e

COLOR="96"
function log {
	C="\033[0;${COLOR}m"
	NC='\033[0m' # No Color

	echo -e "${C}$@${NC}"
}

log "Start deploy infrastructure"

args=""
# TODO uncomment in future for using `./deploy.sh --network ic`
# args=$@

if [ -z "$args" ]
then
	log "Local deploy"

	log "Deploy Internet Identity"
	cd gateway/frontend
	git clone git@github.com:dfinity/internet-identity.git || (echo "Internet identity exists. Pulling" && cd ./internet-identity && git pull && cd ../)
	cd ./internet-identity
	rm -rf ./.dfx
	npm i
	II_FETCH_ROOT_KEY=1 II_DUMMY_CAPTCHA=1 II_DUMMY_AUTH=1 dfx deploy --no-wallet --argument '(null)'
	dfx canister call internet_identity init_salt
	INTERNET_IDENTITY_CANISTER_ID=$(dfx canister id internet_identity)
	cd ../../../
fi

log "Build root wallet..."
cd wallet-backend
rm -rf ./.dfx/local
dfx build --all --check
cd ..
log "Root wallet built"

log "Deploy deployer..."
cd deployer-backend
rm -rf ./.dfx/local
dfx deploy $args --argument "(principal \"${identity}\", principal \"${identity}\")"
deployer=$(dfx canister $args id union-deployer)
log "Deployer deployed"
cd ../

log "Deploy gateway backend..."
cd gateway/backend
rm -rf ./.dfx/local
dfx deploy $args --argument "(principal \"${identity}\", principal \"${deployer}\")"
gateway_backend=$(dfx canister $args id gateway)
cd ../..
log "Gateway backend deployed"

log "Building frontend..."
cd gateway/frontend/gateway
rm -rf ./.dfx/local
yarn && yarn build
log "Frontend built"
cd ../../../

# log "Deploy frontend..."
# cd gateway/frontend/gateway
# rm -rf ./.dfx/local
# yarn
# dfx deploy
# gateway_frontend=$(dfx canister $args id union-wallet-frontend)
# log "Frontend deployed"
# cd ../../../

COLOR="92"
log deployer=$deployer
log gateway_backend=$gateway_backend
# log gateway_frontend="http://localhost:8000?canisterId=$gateway_frontend"
log internet-identity="http://localhost:8000?canisterId=$INTERNET_IDENTITY_CANISTER_ID"

export deployer
export gateway_backend