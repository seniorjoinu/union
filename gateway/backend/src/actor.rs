use crate::common::api::{
    AttachToUnionWalletRequest, DetachFromUnionWalletRequest, GetAttachedUnionWalletsResponse,
    InvoiceId, InvoiceType, SpawnUnionWalletRequest, SpawnUnionWalletResponse,
    TransferControlRequest,
};
use crate::common::gateway::State;
use crate::guards::{not_anonymous, only_controller};
use ic_cdk::api::call::call_with_payment;
use ic_cdk::api::time;
use ic_cdk::export::candid::export_service;
use ic_cdk::export::Principal;
use ic_cdk::storage::{stable_restore, stable_save};
use ic_cdk::{call, caller};
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

#[update(guard = "not_anonymous")]
pub fn spawn_union_wallet(req: SpawnUnionWalletRequest) -> SpawnUnionWalletResponse {
    let invoice_id =
        get_state().create_invoice(InvoiceType::SpawnUnionWallet(req), caller(), time());

    SpawnUnionWalletResponse { invoice_id }
}

async fn process_paid_invoice(id: InvoiceId) {
    get_state()
        .set_invoice_paid(id)
        .expect("Unable to process paid invoice");

    let invoice = get_state().invoices.get(&id).unwrap();

    // TODO: add deployer client and use it
    // TODO: spawn a wallet

    match invoice.invoice_type {
        InvoiceType::SpawnUnionWallet(req) => {
            call_with_payment(
                get_state().deployer_canister_id,
                "spawn_wallet",
                (req,),
                1_000_000_000_000,
            )
            .await
            .expect("Unable to call deployer.spawn_wallet");
        }
    }
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
fn init(controller: Principal, deployer_canister_id: Principal) {
    let state = State::new(controller, deployer_canister_id);

    unsafe {
        STATE = Some(state);
    }
}

#[pre_upgrade]
fn pre_upgrade_hook() {
    let state = unsafe { STATE.take() };

    stable_save((state,)).expect("Unable to save the state")
}

#[post_upgrade]
fn post_update_hook() {
    let (state,): (Option<State>,) = stable_restore().expect("Unable to restore the state");

    unsafe { STATE = state }
}
