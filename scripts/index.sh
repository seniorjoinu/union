#!/usr/bin/env bash
set -e
. ./utils.sh

echo -e "\033[33mWARNING: used incorrect 'cycles' parameter for production\033[0m"
echo -e "\033[33mWARNING: wallet-creator identity does not have cycles\033[0m"
echo -e "\033[33mWARNING: --network=ic unused option for production\033[0m"

cd ./util/
bash ./build.sh
cd ../

echo "" > $root_folder/.env

source ./identity-setup.sh
echo "export identity=${identity}" >> $root_folder/.env

source ./infra-deploy.sh
echo "export deployer=${deployer}" >> $root_folder/.env
echo "export gateway_backend=${gateway_backend}" >> $root_folder/.env

./version-deploy.sh

source ./infra-setup.sh
echo "export root_wallet=${root_wallet}" >> $root_folder/.env

source ./frontend-create.sh
echo "export frontend_canister_id_did='${frontend_canister_id_did}'" >> $root_folder/.env
echo "export gateway_frontend=$(parse_principal $frontend_canister_id_did)" >> $root_folder/.env

source ./frontend-install-wasm.sh

source ./batches-create.sh
echo "export batch_ids=${exportable_batch_ids}" >> $root_folder/.env

./batches-send.sh

./batches-delete.sh
