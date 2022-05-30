# Union general frontend

## Quick start

- `dfx start --clean`
- `dfx build --all --check` for `wallet-backend`
- `dfx deploy` for `wallet-deployer`
- `dfx deploy` here
- `yarn dev` here

Check `process.env` variable for canister ids in [global.d.ts](./global.d.ts) and [vite.config](./vite.config.ts). Canister controllers already implemented in [src/services/controllers](./src/services/controllers/).

## Target case

Here is described the target infrastructure deployment option as it should be in production. This case is to be implemented.

### Start infrastructure

- deploy deployer
- deploy root union through deployer
<!-- `dfx deploy union --argument '(principal "$(dfx identity get-principal)")'` -->
- \*setup roles
- get `certified_assets` canister wasm.
- Setup and run facade execution #1
  - execute `create canister` call to management canister throught union. Now, principal of `union` is controller.
  - execute `install code` call to management canister throught union with `certified_assets` wasm. Pass `union` principal to init args (this will authorize `union` principal for assets upload).
- Now, we are have `frontend` canister with `union` principal as single controller and single authorized uploader.

NOTE: every facade operation might be simplified by deployer canister implementation

### First upload assets

- Build frontend and get assets folder. Assets must me less than 2mb (for simplicity first)
- Setup and run facade execution #2 (first deloy only)
  - execute `create_batch` call to `frontend` and get `batch_id`
  - execute `create_chunk` call to `frontend` with recieved `batch_id` and content (as byte array) of every file
  - ... make previous step for every asset from dist
  - execute `commit_batch` call to `frontend` with recieved `batch_id` and chunk_ids like this
    ```
    commit_batch({
    	batch_id,
    	operations: [
    		{ CreateAsset: { key: FILE_1_PATH, content_type: FILE_1_CONTENT_TYPE } },
    		{ SetAssetContent: { key: FILE_1_PATH, sha256: [], chunk_ids: [FILE_1_CHUNK_ID], content_encoding: 'identity' } },
    		... repeat for all uploaded files
    	]
    });
    ```
- Now, frontend canister is ready and controlled by root `union`

### Upgrade assets

- Build frontend and get assets folder. Assets must me less than 2mb (for simplicity first)
- Setup and run facade execution #3
  - execute `clear` call to `frontend` and get `batch_id`
  - execute commands from `facade execution #2`

### Deploy your personal union

`wallet-deployer` must be deployed by root union and will be blackholed. May be `wallet-deployer` will have your separated wallet canister for accepting payments and union deployment.

TODO

## Development case only

- deploy root union `dfx deploy union --argument '(principal "$(dfx identity get-principal)")'`
- \*setup roles
- manually deploy frontend canister
- authorize `union` principal for frontend canister
- add `union` principal to frontend canister controllers
- now, we are have a target scheme with additional local controller and able to upload assets and execute votings on `union`

## Code assumptions

- [Lib folder](./src/lib/README.md) contains potential separated npm packages
- IMPORTANT!!! unionSerializer must use candid from `export_candid` method of current canister

## Troubleshooting

### Address in use

```
~/.cache/dfinity/uninstall.sh
lsof -i:8000
kill -9 *pid*
sh -ci "$(curl -fsSL https://smartcontracts.org/install.sh)"
```
