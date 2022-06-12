#!/usr/bin/env bash
set -e

# FIXME
echo Building npm deps
cd ../../libs/serialize
yarn build
# cd ../components
# yarn build
cd ../candid-parser
yarn build
cd ../client
yarn build
cd ../../gateway/frontend

cp ../../deployer-backend/canister/.dfx/local/canisters/union-deployer/union-deployer.did.d.ts ./src/assets/union-deployer.did.d.ts
cp ../../deployer-backend/canister/.dfx/local/canisters/union-deployer/union-deployer.did.js ./src/assets/union-deployer.did.js

cp ../../wallet-backend/.dfx/local/canisters/union-wallet/union-wallet.did.d.ts ./src/assets/union-wallet.did.d.ts
cp ../../wallet-backend/.dfx/local/canisters/union-wallet/union-wallet.did.js ./src/assets/union-wallet.did.js

cp ../../history-ledger/canister/.dfx/local/canisters/history-ledger/history-ledger.did.d.ts ./src/assets/history-ledger.did.d.ts
cp ../../history-ledger/canister/.dfx/local/canisters/history-ledger/history-ledger.did.js ./src/assets/history-ledger.did.js

cp ../backend/.dfx/local/canisters/gateway/gateway.did.d.ts ./src/assets/gateway.did.d.ts
cp ../backend/.dfx/local/canisters/gateway/gateway.did.js ./src/assets/gateway.did.js

