#!/bin/bash

cargo build --target wasm32-unknown-unknown --package union-deployer --release && \
     ic-cdk-optimizer ./target/wasm32-unknown-unknown/release/union_deployer.wasm -o ./target/wasm32-unknown-unknown/release/union-deployer-opt.wasm