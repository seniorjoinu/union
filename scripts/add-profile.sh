#!/usr/bin/env bash
set -e

identity=
root_wallet=

while getopts ":-:" optchar; do
    case "${optchar}" in
        -)
            case "${OPTARG}" in
                ii)
                    val="${!OPTIND}"; OPTIND=$(( $OPTIND + 1 ))
										identity=$val
                    echo "Parsing option: '--${OPTARG}', value: '${val}'" >&2;
                    ;;
                ii=*)
                    val=${OPTARG#*=}
                    opt=${OPTARG%=$val}
										identity=$val
                    echo "Parsing option: '--${opt}', value: '${val}'" >&2
                    ;;
                wallet)
                    val="${!OPTIND}"; OPTIND=$(( $OPTIND + 1 ))
										root_wallet=$val
                    echo "Parsing option: '--${OPTARG}', value: '${val}'" >&2;
                    ;;
                wallet=*)
                    val=${OPTARG#*=}
                    opt=${OPTARG%=$val}
										root_wallet=$val
                    echo "Parsing option: '--${opt}', value: '${val}'" >&2
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
[ -z "$root_wallet" ] && echo "Wallet does not found" && exit;

echo identity=$identity
echo root_wallet=$root_wallet

echo "Add internet-identity principal to root wallet"
create_role_program_args='(record {
	role_type = variant {
		Profile = record {
			principal_id = principal \"'$identity'\";
    	name = \"Agent\";
    	description = \"Agent profile for manipulations\";
			active = false;
		}
	}
})'
create_role_args="(record {
	title = \"Add internet-identity principal profile\";
	description = \"Internet-identity profile ${identity}\";
	rnp = record { role_id = 1 : nat32; permission_id = 0 : nat16; };
	authorization_delay_nano = 0 : nat64;
	program = variant {
		RemoteCallSequence = vec {
			record {
				endpoint = record {
					canister_id = principal \"${root_wallet}\";
					method_name = \"create_role\";
				};
				cycles = 0 : nat64;
				args = variant {
					CandidString = vec {
						\"${create_role_program_args}\"
					}	: vec text
				};
			}
		}
	}
})"
echo payload=$create_role_args
dfx canister $args call $root_wallet "execute" "$create_role_args"
