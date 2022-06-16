#!/usr/bin/env bash
set -e
. ./utils.sh
. $ROOT_FOLDER/.env

cd ../demo
rm -rf ./.dfx

./deploy.sh