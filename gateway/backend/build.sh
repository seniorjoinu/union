#!/bin/bash

SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")
cd "$SCRIPTPATH" || exit

cargo build --target wasm32-unknown-unknown --package union-gateway --release && \
     ic-cdk-optimizer ./target/wasm32-unknown-unknown/release/union_gateway.wasm -o ./target/wasm32-unknown-unknown/release/union-gateway-opt.wasm