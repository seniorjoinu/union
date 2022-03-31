#!/usr/bin/env bash
set -e

cp ../../../wallet-deployer/canister/.dfx/local/canisters/union-deployer/union-deployer.did.d.ts ./src/assets/union-deployer.did.d.ts
cp ../../../wallet-deployer/canister/.dfx/local/canisters/union-deployer/union-deployer.did.js ./src/assets/union-deployer.did.js
cp ../../../wallet-backend/.dfx/local/canisters/union-wallet/union-wallet.did.d.ts ./src/assets/union-wallet.did.d.ts
cp ../../../wallet-backend/.dfx/local/canisters/union-wallet/union-wallet.did.js ./src/assets/union-wallet.did.js

cp ../../../wallet-backend/.dfx/local/canisters/union-wallet/union-wallet.wasm ./public/union-wallet.wasm
