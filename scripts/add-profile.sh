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

response=$(dfx canister call --query $root_union get_access_config "(record { id = ${UNLIMITED_ACCESS_CONFIG_ID} : nat64 })")
existing_allowees=$(./uc did get "${response}" "0.access_config.allowees.#items")
escaped_existing_allowees="${existing_allowees//\"/\\\"}"
update_access_config_program_args='(record {
	id = '$UNLIMITED_ACCESS_CONFIG_ID' : nat64;
	new_allowees = vec {
		'${existing_allowees//\"/\\\"}'
		variant {
			Profile = principal \"'$identity'\"
		};
	};
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
			};
			record {
				endpoint = record {
					canister_id = principal \"${root_union}\";
					method_name = \"update_access_config\";
				};
				cycles = 0 : nat64;
				args = variant {
					CandidString = vec {
						\"${update_access_config_program_args}\"
					}	: vec text
				};
			};
		}
	}
})"
log "[add-profile]" payload=$create_profile_args
dfx canister $args call $root_union "execute" "$create_profile_args"

COLOR="33"
log "WARNING: TODO need deploy root union and ledger with gateway_backend for notifications"
COLOR="96"
log "Go to http://${gateway_frontend}.localhost:8000/wallet/${root_union}/profile and accept your shares"
log "Or production http://${gateway_frontend}.ic0.app/wallet/${root_union}/profile"
log "Or local http://localhost:3000/wallet/${root_union}/profile"
