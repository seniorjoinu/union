#!/usr/bin/env bash
set -e

COLOR="96"
function log {
	C="\033[0;${COLOR}m"
	NC='\033[0m' # No Color

	echo -e "${C}$@${NC}"
}

identity_name="wallet-creator"
dfx identity use $identity_name || (dfx identity new $identity_name && dfx identity use $identity_name)

# log "Copying $identity_name .pem file here"
# cp ~/.config/dfx/identity/$identity_name/identity.pem ./scripts/identity.pem || echo "Already copied"

log "Your identity is $identity_name = $(dfx identity $args get-principal)"

identity=$(dfx identity $args get-principal)

export identity
# echo "identity=${identity}" >> .env
