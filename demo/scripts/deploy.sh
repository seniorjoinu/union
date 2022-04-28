#!/usr/bin/env bash
set -e

args=

dfx $args deploy

FEED_APP_CANISTER_ID=$(dfx canister id feed-app)
echo "http://localhost:8000?canisterId=${FEED_APP_CANISTER_ID}"
