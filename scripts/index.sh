#!/usr/bin/env bash
set -e
. ./utils.sh

echo -e "\033[33mWARNING: used incorrect 'cycles' parameter for production\033[0m"
echo -e "\033[33mWARNING: union-creator identity does not have cycles\033[0m"
echo -e "\033[33mWARNING: --network=ic unused option for production\033[0m"

cd ./util/
bash ./build.sh
cd ../

echo "" > $ROOT_FOLDER/.env

source ./identity-setup.sh
echo "export identity=${identity}" >> $ROOT_FOLDER/.env

source ./infra-deploy.sh
echo "export deployer=${deployer}" >> $ROOT_FOLDER/.env
echo "export gateway_backend=${gateway_backend}" >> $ROOT_FOLDER/.env

./version-deploy.sh

./infra-presetup.sh
source ./root-union-deploy.sh
echo "export root_union=${root_union}" >> $ROOT_FOLDER/.env
echo "export history_ledger=${history_ledger}" >> $ROOT_FOLDER/.env
source ./infra-setup.sh

source ./frontend-create.sh
echo "export frontend_canister_id_did='${frontend_canister_id_did}'" >> $ROOT_FOLDER/.env
echo "export gateway_frontend=$(parse_principal $frontend_canister_id_did)" >> $ROOT_FOLDER/.env

# source ./frontend-install-wasm.sh

# source ./batches-create.sh
# echo "export batch_ids=${exportable_batch_ids}" >> $ROOT_FOLDER/.env

# ./batches-send.sh

# ./batches-delete.sh
