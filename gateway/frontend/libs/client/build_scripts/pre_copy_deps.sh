#!/usr/bin/env bash
set -e

cp ../../../../wallet-backend/.dfx/local/canisters/union-wallet/union-wallet.did.d.ts ./src/assets/union-wallet.did.d.ts
cp ../../../../wallet-backend/.dfx/local/canisters/union-wallet/union-wallet.did.js ./src/assets/union-wallet.did.js
cp ../../../../.env ./.env
