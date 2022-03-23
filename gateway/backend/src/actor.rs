use crate::common::api::{
    AttachToUnionWalletRequest, DetachFromUnionWalletRequest, GetAttachedUnionWalletsResponse,
    TransferControlRequest,
};
use crate::common::gateway::State;
use crate::guards::{not_anonymous, only_controller};
use ic_cdk::caller;
use ic_cdk::export::candid::export_service;
use ic_cdk::export::Principal;
use ic_cdk::storage::{stable_restore, stable_save};
use ic_cdk_macros::{init, post_upgrade, pre_upgrade, query, update};

pub mod common;
pub mod guards;

#[update(guard = "only_controller")]
pub fn transfer_control(req: TransferControlRequest) {
    get_state().update_controller(req.new_controller);
}

#[update(guard = "not_anonymous")]
pub fn attach_to_union_wallet(req: AttachToUnionWalletRequest) {
    get_state().attach_user_to_union_wallet(caller(), req.union_wallet_id);
}

#[update(guard = "not_anonymous")]
pub fn detach_from_union_wallet(req: DetachFromUnionWalletRequest) {
    get_state().detach_user_from_union_wallet(caller(), req.union_wallet_id);
}

#[update(guard = "not_anonymous")]
pub fn get_attached_union_wallets() -> GetAttachedUnionWalletsResponse {
    let wallet_ids = get_state().get_union_wallets_attached_to_user(&caller());

    GetAttachedUnionWalletsResponse { wallet_ids }
}

export_service!();

#[query(name = "__get_candid_interface_tmp_hack")]
fn export_candid() -> String {
    __export_service()
}

static mut STATE: Option<State> = None;

pub fn get_state() -> &'static mut State {
    unsafe { STATE.as_mut().unwrap() }
}

#[init]
fn init(controller: Principal) {
    let state = State::new(controller);

    unsafe {
        STATE = Some(state);
    }
}

#[pre_upgrade]
fn pre_upgrade_hook() {
    let state = unsafe { STATE.clone().unwrap() };

    stable_save((state,)).expect("Unable to save the state")
}

#[post_upgrade]
fn post_update_hook() {
    let (state,): (State,) = stable_restore().expect("Unable to restore the state");

    unsafe { STATE = Some(state) }
}
