pub mod deployer;
pub mod management_canister_client;
pub mod types;
pub mod utils;

use crate::common::utils::ToCandidType;
use ic_cdk::export::candid::Principal;
use management_canister_client::*;

pub async fn deploy_canister_install_code_update_settings(
    this: Principal,
    args_raw: Vec<u8>,
    wasm: Vec<u8>,
) -> Principal {
    let cycles = 1_000_000_000_000u64;
    let management_canister = Principal::management_canister();

    let (resp,) = management_canister
        .create_canister(CreateCanisterRequest { settings: None }, cycles)
        .await
        .to_candid_type()
        .expect("Unable to create canister");

    management_canister
        .install_code(InstallCodeRequest {
            wasm_module: wasm,
            canister_id: resp.canister_id,
            mode: CanisterInstallMode::install,
            arg: args_raw,
        })
        .await
        .to_candid_type()
        .expect("Unable to install code");

    management_canister
        .update_settings(UpdateSettingsRequest {
            canister_id: resp.canister_id,
            settings: CanisterSettings {
                controllers: vec![this],
            },
        })
        .await
        .to_candid_type()
        .expect("Unable to update settings");

    resp.canister_id
}
