#!/usr/bin/env bash
set -e

echo "Start deploy infrastructure"

args=""
# TODO uncomment in future for using `./deploy.sh --network ic`
# args=$@

if [ -z "$args" ]
then
	echo "Local deploy"

	echo "Deploy Internet Identity"
	cd gateway/frontend
	git clone git@github.com:dfinity/internet-identity.git || (echo "Internet identity exists. Pulling" && cd ./internet-identity && git pull && cd ../)
	cd ./internet-identity
	rm -rf ./.dfx
	npm i
	II_FETCH_ROOT_KEY=1 II_DUMMY_CAPTCHA=1 II_DUMMY_AUTH=1 dfx deploy --no-wallet --argument '(null)'
	dfx canister call internet_identity init_salt
	echo "Internet-identity here http://localhost:8000?canisterId=$(dfx canister id internet_identity)"
	INTERNET_IDENTITY_CANISTER_ID=$(dfx canister id internet_identity)
	cd ../../../
fi

identity=$(dfx identity $args get-principal)

echo "Build root wallet"
cd wallet-backend
rm -rf ./.dfx/local
dfx build --all --check
cd ..
echo "Root wallet built"

echo "Deploy deployer"
cd deployer-backend
rm -rf ./.dfx/local
dfx deploy $args --argument "(principal \"${identity}\", principal \"${identity}\")"
deployer=$(dfx canister $args id union-deployer)
echo "Deployer deployed"
cd ../

echo "Deploy gateway backend"
cd gateway/backend
rm -rf ./.dfx/local
dfx deploy $args --argument "(principal \"${identity}\", principal \"${deployer}\")"
gateway_backend=$(dfx canister $args id gateway)
cd ../..
echo "Gateway backend deployed"

echo "Deploy frontend"
cd gateway/frontend/gateway
rm -rf ./.dfx/local
yarn
dfx deploy
echo "http://localhost:8000?canisterId=$(dfx canister id union-wallet-frontend)"
echo "Frontend deployed"
cd ../../../

echo deployer=$deployer
echo gateway_backend=$gateway_backend
