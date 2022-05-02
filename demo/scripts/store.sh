#!/usr/bin/env bash
set -e

args=
uwc=../scripts/uwc

# FIXME
echo Building npm deps
cd ../gateway/frontend/libs/client
yarn build
cd ../serialize
yarn build
cd ../../../../demo

yarn build

FEED_APP_CANISTER_ID=$(dfx canister $args id feed-app)
echo Storing assets to $FEED_APP_CANISTER_ID

assets_folder_path="./dist"

files=`cd $assets_folder_path && find . -type f`
rm ./tmp_args.txt 2> /dev/null || echo ""

batch_ids=()
for eachfile in $files
do
	key=${eachfile/\./}
	filepath="${assets_folder_path}${key}"
	content_type=$(
		if [[ $filepath == *.js ]]; then
			echo "application/javascript"
		else 
			file -b --mime-type $filepath
		fi
	)
	echo $key $content_type

	file_bytes=$($uwc did encode --mode blob $filepath)
	store_args='(record {
		key = "'$key'";
		content_type = "'$content_type'";
		content_encoding = "identity";
		content = blob "'$file_bytes'";
	})'
	echo "$store_args" > ./tmp_args.txt

	store_response=$(
		$uwc canister $FEED_APP_CANISTER_ID "store" ./tmp_args.txt
	)

	echo $store_response
done

rm ./tmp_args.txt 2> /dev/null || echo ""

echo Assets successfull stored to "http://${FEED_APP_CANISTER_ID}.localhost:8000"