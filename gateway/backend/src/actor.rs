use crate::common::api::{
    AttachToUnionWalletRequest, ControllerSpawnWalletRequest, ControllerSpawnWalletResponse,
    DetachFromUnionWalletRequest, GetAttachedUnionWalletsResponse, GetMyNotificationsResponse,
    ProveBillPaidRequest, ProveBillPaidResponse, SpawnUnionWalletRequest, SpawnUnionWalletResponse,
    TransferControlRequest, UpgradeUnionWalletRequest,
};
use crate::common::gateway::{ProfileCreatedNotification, State};
use crate::common::types::{BillId, BillType};
use crate::guards::{not_anonymous, only_controller, only_mentioned_union_wallet};
use ic_cdk::api::time;
use ic_cdk::export::candid::export_service;
use ic_cdk::export::Principal;
use ic_cdk::storage::{stable_restore, stable_save};
use ic_cdk::{call, caller, id, print};
use ic_cdk_macros::{init, post_upgrade, pre_upgrade, query, update};
use ic_event_hub::api::IEventHubClient;
use ic_event_hub::types::{CallbackInfo, Event, IEvent, IEventFilter, SubscribeRequest};
use shared::types::wallet::{
    ProfileActivatedEvent, ProfileActivatedEventFilter, ProfileCreatedEvent,
    ProfileCreatedEventFilter,
};
use union_deployer_client::api::{SpawnWalletRequest, UpgradeWalletVersionRequest};
use union_deployer_client::client::IDeployerBackend;

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

#[query]
pub fn get_attached_union_wallets() -> GetAttachedUnionWalletsResponse {
    let wallet_ids = get_state().get_union_wallets_attached_to_user(&caller());

    GetAttachedUnionWalletsResponse { wallet_ids }
}

#[update(guard = "not_anonymous")]
pub async fn spawn_union_wallet(req: SpawnUnionWalletRequest) -> SpawnUnionWalletResponse {
    let bill_id = BillId::from(0);

    let deployer_req = SpawnWalletRequest {
        wallet_creator: req.wallet_creator,
        version: req.version,
        gateway: id(),
    };

    get_state().create_bill(
        bill_id.clone(),
        BillType::SpawnUnionWallet(deployer_req),
        caller(),
        time(),
    );

    SpawnUnionWalletResponse { bill_id }
}

#[update]
pub async fn upgrade_union_wallet(req: UpgradeUnionWalletRequest) {
    // TODO: doesn't work
    // [Canister rdmx6-jaaaa-aaaaa-aaadq-cai] Panicked at 'called `Result::unwrap()` on an `Err` value: PoisonError { .. }', .cargo/registry/src/github.com-1ecc6299db9ec823/ic-cdk-0.5.0/src/api/call.rs:103:27

    let upgrade_req = UpgradeWalletVersionRequest {
        canister_id: caller(),
        new_version: req.new_version,
    };

    get_state()
        .deployer_canister_id
        .upgrade_wallet_version(upgrade_req)
        .await
        .expect("Unable to call deployer.upgrade_wallet_version");
}

#[update(guard = "only_controller")]
pub async fn controller_spawn_wallet(
    req: ControllerSpawnWalletRequest,
) -> ControllerSpawnWalletResponse {
    let wallet_creator = req.wallet_creator;

    let deployer_req = SpawnWalletRequest {
        wallet_creator,
        version: req.version,
        gateway: id(),
    };

    let (res,) = get_state()
        .deployer_canister_id
        .spawn_wallet(deployer_req, 1_000_000_000_000)
        .await
        .expect("Unable to call deployer.spawn_wallet");

    get_state().attach_user_to_union_wallet(wallet_creator, res.canister_id);

    let created_filter = ProfileCreatedEventFilter {
        profile_owner: None,
    };
    let activated_filter = ProfileActivatedEventFilter {
        profile_owner: None,
    };

    res.canister_id
        .subscribe(SubscribeRequest {
            callbacks: vec![
                CallbackInfo {
                    filter: created_filter.to_event_filter(),
                    method_name: String::from("events_callback"),
                },
                CallbackInfo {
                    filter: activated_filter.to_event_filter(),
                    method_name: String::from("events_callback"),
                },
            ],
        })
        .await
        .expect("Unable to call gateway.subscribe");

    ControllerSpawnWalletResponse {
        canister_id: res.canister_id,
    }
}

#[update]
pub async fn prove_bill_paid(req: ProveBillPaidRequest) -> ProveBillPaidResponse {
    let caller = caller();

    get_state()
        .set_bill_paid(req.proof.bill_id.clone())
        .expect("Unable to process paid invoice");

    let bill = get_state().bills.get(&req.proof.bill_id).unwrap();

    // TODO: add deployer client and use it

    match &bill.bill_type {
        BillType::SpawnUnionWallet(spawn_request) => {
            let (res,) = get_state()
                .deployer_canister_id
                .spawn_wallet(spawn_request.clone(), 1_000_000_000_000)
                .await
                .expect("Unable to call deployer.spawn_wallet");

            get_state().attach_user_to_union_wallet(caller, res.canister_id);

            let created_filter = ProfileCreatedEventFilter {
                profile_owner: None,
            };
            let activated_filter = ProfileActivatedEventFilter {
                profile_owner: None,
            };

            res.canister_id
                .subscribe(SubscribeRequest {
                    callbacks: vec![
                        CallbackInfo {
                            filter: created_filter.to_event_filter(),
                            method_name: String::from("events_callback"),
                        },
                        CallbackInfo {
                            filter: activated_filter.to_event_filter(),
                            method_name: String::from("events_callback"),
                        },
                    ],
                })
                .await
                .expect("Unable to call gateway.subscribe");

            ProveBillPaidResponse {
                canister_id: res.canister_id,
            }
        }
    }
}

#[query]
fn get_my_notifications() -> GetMyNotificationsResponse {
    let notifications = get_state().get_notifications_by_user_cloned(&caller());

    GetMyNotificationsResponse { notifications }
}

#[update(guard = "only_mentioned_union_wallet")]
fn events_callback(events: Vec<Event>) {
    for event in events {
        match event.get_name().as_str() {
            "ProfileCreatedEvent" => {
                let ev: ProfileCreatedEvent = ProfileCreatedEvent::from_event(event);

                get_state().create_notification(ev.profile_owner, caller());
            }
            "ProfileActivatedEvent" => {
                let ev: ProfileActivatedEvent = ProfileActivatedEvent::from_event(event);

                get_state().remove_notifications(caller(), ev.profile_owner);
            }
            _ => print("Unknown event"),
        }
    }
}

#[query]
fn get_controller() -> Principal {
    get_state().controller
}

export_service!();

#[query]
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
