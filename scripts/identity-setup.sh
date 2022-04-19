#!/usr/bin/env bash
set -e
. ./utils.sh

identity_name="wallet-creator"
dfx identity use $identity_name || (dfx identity new $identity_name && dfx identity use $identity_name)

log "[identity-setup] Your identity is $identity_name = $(dfx identity $args get-principal)"

identity=$(dfx identity $args get-principal)

export identity

