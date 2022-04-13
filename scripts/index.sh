#!/usr/bin/env bash
set -e

echo -e "\033[33mWARNING: used incorrect 'cycles' parameter for production\033[0m"
echo -e "\033[33mWARNING: wallet-creator identity does not have cycles\033[0m"
echo -e "\033[33mWARNING: --network=ic unused option for production\033[0m"

cd ./scripts/util/
bash ./build.sh
cd ../../

echo "" > .env

source ./scripts/identity-setup.sh
echo "export identity=${identity}" >> .env

source ./scripts/infra-deploy.sh
echo "export deployer=${deployer}" >> .env
echo "export gateway_backend=${gateway_backend}" >> .env

source ./scripts/infra-setup.sh
echo "export root_wallet=${root_wallet}" >> .env

./scripts/version-deploy.sh

source ./scripts/frontend-create.sh
echo 'export frontend_canister_id_did="'$frontend_canister_id_did'"' >> .env

source ./scripts/batches-create.sh
echo "export batch_ids=${exportable_batch_ids}" >> .env

./scripts/batches-send.sh
