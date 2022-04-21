#!/usr/bin/env bash

SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")
cd "$SCRIPTPATH" || exit

cargo build --target wasm32-unknown-unknown --release --package union-deployer && \
 ic-cdk-optimizer ./target/wasm32-unknown-unknown/release/union_deployer.wasm -o ./target/wasm32-unknown-unknown/release/union-deployer-opt.wasm
