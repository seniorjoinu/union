#!/bin/bash

SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")
cd "$SCRIPTPATH" || exit

cargo build --target wasm32-unknown-unknown --package union-history-ledger --release && \
     ic-cdk-optimizer ./target/wasm32-unknown-unknown/release/union_history_ledger.wasm -o ./target/wasm32-unknown-unknown/release/union-history-ledger-opt.wasm