#!/usr/bin/env bash
set -e

cargo build --release && cp ./target/release/uwc ../uwc