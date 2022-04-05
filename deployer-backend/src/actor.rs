mod common;

use crate::common::deployer::State;
use crate::common::guards::{only_binary_controller, only_spawn_controller};
use crate::common::types::{
    CreateBinaryVersionRequest, DeleteBinaryVersionRequest, DownloadBinaryRequest,
    DownloadBinaryResponse, GetBinaryVersionInfosRequest, GetBinaryVersionInfosResponse,
    GetBinaryVersionsResponse, GetInstanceIdsResponse, GetInstancesRequest, GetInstancesResponse,
    GetLatestVersionResponse, ReleaseBinaryVersionRequest, SpawnWalletRequest, SpawnWalletResponse,
    TransferControlRequest, UpdateBinaryVersionDescriptionRequest, UpgradeWalletVersionRequest,
    UploadBinaryRequest,
};
use crate::common::upgrade_canister;
use common::deploy_canister_install_code_update_settings;
use ic_cdk::api::time;
use ic_cdk::export::candid::{encode_one, export_service};
use ic_cdk::export::Principal;
use ic_cdk::id;
use ic_cdk::storage::{stable_restore, stable_save};
use ic_cdk_macros::{init, post_upgrade, pre_upgrade, query, update};

#[update(guard = "only_binary_controller")]
fn transfer_binary_control(req: TransferControlRequest) {
    get_state().transfer_binary_control(req.new_controller);
}

#[update(guard = "only_spawn_controller")]
fn transfer_spawn_control(req: TransferControlRequest) {
    get_state().transfer_spawn_control(req.new_controller);
}

#[update(guard = "only_spawn_controller")]
async fn spawn_wallet(req: SpawnWalletRequest) -> SpawnWalletResponse {
    let binary = get_state()
        .get_non_deleted_binary(&req.version)
        .expect("Unable to find binary version");

    let canister_id = deploy_canister_install_code_update_settings(
        id(),
        encode_one(req.wallet_creator).expect("Unable to encode args"),
        binary,
    )
    .await;

    get_state().set_instance_version(canister_id, req.version.clone(), time());

    SpawnWalletResponse { canister_id }
}

#[update(guard = "only_spawn_controller")]
async fn upgrade_wallet_version(req: UpgradeWalletVersionRequest) {
    get_state()
        .get_instance(&req.canister_id)
        .expect("Unable to upgrade");

    // todo: maybe it is correct to check for a version compatibility in order of downgrades

    let binary = get_state()
        .get_non_deleted_binary(&req.new_version)
        .expect("Unable to find binary version");

    upgrade_canister(req.canister_id, binary).await;

    get_state().set_instance_version(req.canister_id, req.new_version, time());
}

#[update(guard = "only_binary_controller")]
fn create_binary_version(req: CreateBinaryVersionRequest) {
    get_state()
        .create_binary_version(req.version, req.description, time())
        .expect("Unable to create new binary version");
}

#[update(guard = "only_binary_controller")]
fn update_binary_version_description(req: UpdateBinaryVersionDescriptionRequest) {
    get_state()
        .update_binary_version_description(&req.version, req.new_description, time())
        .expect("Unable to update binary version description");
}

#[update(guard = "only_binary_controller")]
fn release_binary_version(req: ReleaseBinaryVersionRequest) {
    get_state()
        .release_binary_version(&req.version, time())
        .expect("Unable to release binary version");
}

#[update(guard = "only_binary_controller")]
fn delete_binary_version(req: DeleteBinaryVersionRequest) {
    get_state()
        .delete_binary_version(&req.version, time())
        .expect("Unable to delete binary version");
}

#[update(guard = "only_binary_controller")]
fn upload_binary(req: UploadBinaryRequest) {
    get_state()
        .upload_binary(&req.version, req.binary, time())
        .expect("Unable to upload binary");
}

#[query]
fn download_binary(req: DownloadBinaryRequest) -> DownloadBinaryResponse {
    let binary = get_state()
        .download_binary(&req.version)
        .expect("Unable to download binary");

    DownloadBinaryResponse { binary }
}

#[query]
fn get_binary_versions() -> GetBinaryVersionsResponse {
    let versions = get_state().get_binary_versions();

    GetBinaryVersionsResponse { versions }
}

#[query]
fn get_binary_version_infos(req: GetBinaryVersionInfosRequest) -> GetBinaryVersionInfosResponse {
    let mut infos = vec![];

    for version in &req.versions {
        let info = get_state()
            .get_binary_version(version)
            .expect("Unable to get binary version");

        infos.push(info);
    }

    GetBinaryVersionInfosResponse { infos }
}

#[query]
fn get_instance_ids() -> GetInstanceIdsResponse {
    let ids = get_state().get_instance_ids();

    GetInstanceIdsResponse { ids }
}

#[query]
fn get_instances(req: GetInstancesRequest) -> GetInstancesResponse {
    let mut instances = vec![];

    for id in &req.ids {
        let instance = get_state()
            .get_instance(id)
            .expect("Unable to get instance");

        instances.push(instance);
    }

    GetInstancesResponse { instances }
}

#[query]
fn get_latest_version() -> GetLatestVersionResponse {
    let version = get_state()
        .get_latest_version()
        .expect("Unable to get latest version");

    GetLatestVersionResponse { version }
}

// ---------------- STATE ----------------

export_service!();

#[query(name = "__get_candid_interface_tmp_hack")]
fn export_candid() -> String {
    __export_service()
}

static mut STATE: Option<State> = None;

pub fn get_state() -> &'static mut State {
    unsafe { STATE.as_mut().expect("Unable to get state") }
}

#[init]
pub fn init(binary_controller: Principal, spawn_controller: Principal) {
    unsafe { STATE = Some(State::new(binary_controller, spawn_controller)) }
}

#[pre_upgrade]
pub fn pre_upgrade_hook() {
    let state = unsafe { STATE.take() };

    stable_save((state,)).expect("Unable to save the state");
}

#[post_upgrade]
pub fn post_upgrade_hook() {
    let (state,): (Option<State>,) = stable_restore().expect("Unable to restore the state");

    unsafe {
        STATE = state;
    }
}
