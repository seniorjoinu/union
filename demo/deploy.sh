#!/usr/bin/env bash
set -e

# rm -rf ./.dfx

echo Deploy canister
./scripts/deploy.sh

echo Store assets
./scripts/store.sh