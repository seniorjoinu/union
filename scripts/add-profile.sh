#!/usr/bin/env bash
set -e

[ -z "$@" ] && echo "Princpal does not found" && exit;
identity="$@" # FIXME

args=
# TODO target using `./add-profile.sh --network ic`
# args=$@

cd wallet-backend
root_wallet=$(dfx canister $args id union-wallet)
cd ..

echo "Add internet-identity principal to root wallet"
create_role_program_args='(record {
	role_type = variant {
		Profile = record {
			principal_id = principal \"'$identity'\";
    	name = \"Agent\";
    	description = \"Agent profile for manipulations\";
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
dfx canister $args call $root_wallet "execute" "$create_role_args"
