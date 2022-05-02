#!/usr/bin/env bash
set -e

cp ../../../../wallet-backend/.dfx/local/canisters/union-wallet/union-wallet.did.d.ts ./src/union-wallet.did.d.ts
cp ../../../../wallet-backend/.dfx/local/canisters/union-wallet/union-wallet.did.js ./src/union-wallet.did.js
cp ../../../../.env ./.env
