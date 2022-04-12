#!/usr/bin/env bash
set -e

echo "" > .env

source ./scripts/setup-identity.sh
echo "export identity=${identity}" >> .env

source ./scripts/deploy.sh
echo "export deployer=${deployer}" >> .env
echo "export gateway_backend=${gateway_backend}" >> .env

source ./scripts/setup-controllers.sh
echo "export root_wallet=${root_wallet}" >> .env

./scripts/deploy-version.sh

# ./scripts/deploy-frontend.sh
