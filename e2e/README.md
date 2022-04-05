### E2E test

#### Requirements

* `yarn`
* `rust` and `wasm32-unknown-unknown` target
* `dfx 0.9.2`
* `ic-cdk-optimizer` (`cargo install --locked ic-cdk-optimizer`)

#### Local development

* `yarn install` - install dependencies
* `yarn start` - start a replica in a separate terminal
* `yarn build` - build wasm canister code and their ts-bindings
* `yarn test` - start the test
* observe replicas logs
