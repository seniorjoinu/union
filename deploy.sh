#!/usr/bin/env bash
set -e

# TODO: add redeploy option

yarn

cd ./scripts
bash ./index.sh
