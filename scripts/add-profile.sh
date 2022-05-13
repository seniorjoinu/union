#!/usr/bin/env bash
set -e
. ./utils.sh
source $ROOT_FOLDER/.env

identity=
profile_name="Agent"

while getopts ":-:" optchar; do
    case "${optchar}" in
        -)
            case "${OPTARG}" in
                ii)
										identity="${!OPTIND}"; OPTIND=$(( $OPTIND + 1 ))
                    ;;
                ii=*)
										identity=${OPTARG#*=}
                    ;;
                name)
										profile_name="${!OPTIND}"; OPTIND=$(( $OPTIND + 1 ))
                    ;;
                name=*)
										profile_name=${OPTARG#*=}
                    ;;
                *)
                    if [ "$OPTERR" = 1 ] && [ "${optspec:0:1}" != ":" ]; then
                        echo "Unknown option --${OPTARG}" >&2
                    fi
                    ;;
            esac;;
    esac
done

args=
# TODO target using `./add-profile.sh --network ic`
# args=$@

[ -z "$identity" ] && echo "Princpal does not found" && exit;
[ -z "$root_union" ] && echo "Union does not found" && exit;

log "[add-profile]" identity=$identity
log "[add-profile]" root_union=$root_union

log "[add-profile] Add internet-identity principal to root union"
create_profile_program_args='(record {
	id = principal \"'$identity'\";
	name = \"'$profile_name'\";
	description = \"'$profile_name' profile created by add-profile.sh\";
})'
create_profile_args="(record {
	access_config_id = ${UNLIMITED_ACCESS_CONFIG_ID} : nat64;
	program = variant {
		RemoteCallSequence = vec {
			record {
				endpoint = record {
					canister_id = principal \"${root_union}\";
					method_name = \"create_profile\";
				};
				cycles = 0 : nat64;
				args = variant {
					CandidString = vec {
						\"${create_profile_program_args}\"
					}	: vec text
				};
			}
		}
	}
})"
log "[add-profile]" payload=$create_profile_args
dfx canister $args call $root_union "execute" "$create_profile_args"

COLOR="33"
log "WARNING: TODO need deploy root union and ledger with gateway_backend for notifications"
COLOR="96"
log "Go to http://${gateway_frontend}.localhost:8000/wallet/${root_union} and accept your shares"
