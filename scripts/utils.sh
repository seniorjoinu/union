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

root_folder=$(cd ../ && pwd)
current_folder=$(pwd)