#!/usr/bin/env bash
set -e

COLOR="96"
function log {
	C="\033[0;${COLOR}m"
	NC='\033[0m' # No Color

	echo -e "${C}$@${NC}"
}

function parse_principal {
	echo $@ | grep -Eo 'principal \"(\w|-)+\"' | grep -Eo '\"(\w|-)+\"' | grep -Eo '(\w|-)+'
}

ROOT_FOLDER=$(cd ../ && pwd)
CURRENT_FOLDER=$(pwd)

UNLIMITED_ACCESS_CONFIG_ID=1
HAS_PROFILE_GROUP_ID=0
EMERGENCY_VOTING_CONFIG_ID=0