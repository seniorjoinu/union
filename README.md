# Union

Digital organizations for the real world

## Quickstart

### 1. Start the replica and deploy

```shell
dfx start --clean
./deploy.sh
```

### 2. Register via local Internet Identity and get your principal at the gateway frontend

Open [link of organization frontend gateway](http://qaa6y-5yaaa-aaaaa-aaafa-cai.localhost:8000) in the browser, login via local Internet Identity and copy the principal by clicking on it in the top right corner.

### 3. Invite yourself: add your Internet Identity principal as profile in the organization

```shell
cd ./scripts
./add-profile.sh --ii=YOUR_COPIED_PRINCIPAL_FROM_FRONTEND_GATEWAY
```

### 4. Go to the generated link and click "Accept shares"
Check the terminal output. You will receive a link that you need to open in the browser or pass to the invitee.

Example output:

```
Go to http://qaa6y-5yaaa-aaaaa-aaafa-cai.localhost:8000/wallet/qoctq-giaaa-aaaaa-aaaea-cai/profile and accept your shares
Or production http://qaa6y-5yaaa-aaaaa-aaafa-cai.ic0.app/wallet/qoctq-giaaa-aaaaa-aaaea-cai/profile
Or local http://localhost:3000/wallet/qoctq-giaaa-aaaaa-aaaea-cai/profile
```

### 5. Profit! Now you can start configuring your organization

## Infrastructure

You will find all the necessary variables in the `.env` file after deploy. On a clean deployment, the canisters are located here:

- [Internet Identity](http://rrkah-fqaaa-aaaaa-aaaaq-cai.localhost:8000/)
- [Union gateway frontend](http://qaa6y-5yaaa-aaaaa-aaafa-cai.localhost:8000)
- [Thoughter demo project](http://qvhpv-4qaaa-aaaaa-aaagq-cai.localhost:8000)

## Project structure

- [Gateway](./gateway) contains frontend and backend implementations of the gateway entrypoint. To get into the digital organization, the user must go to the gateway and select the organization. In the future, it is planned to implement the possibility of separate front-ends on organizations. The backend performs the discovery function, notification management and much more.
- [Wallet-backend](./wallet-backend/) is a digital organization backend implementation and is the central point of the whole repository.
- [History-ledger](./history-ledger/) is the dynamic history ledger implementation for digital organization needs. It stores execution history and execution results. Several ledgers can be deployed and connected to a single organization.
- [Deployer-backend](./deployer-backend/) is black-holed canister (in theory) and is required for organization deployments, upgrades and delete. It also stores organization wasm versions and allows you to update versions of existing organizations.
- [Demo](./demo) folder contains `Thoughter` project, kind of like Twitter. This is standalone TS + Rust canister with digital organization intergration through `union client`
- [Scripts](./scripts) folder contains shell-scripts and TODOs for proper infrastructure deployment. Also, it contains [union caller utility](./scripts/util/README.md).
- [Libs](./libs) folder contains frontend libraries. These 2 libraries are the most important:
  - `candid-parser` allows to parse `.did` files on frontend and transform types to IDL classes at runtime.
  - `client` is integration library that allows to interact with organizations in your custom frontend application. Check example in [demo](./demo/src/union.tsx) folder.
- [Shared](./shared) folder contains necessary rust functions and code utilities.
