use crate::repository::{set_repositories, take_repositories};
use crate::service::access_config::types::AccessConfigService;
use crate::service::cron::CronService;
use crate::service::events::EventsService;
use crate::service::group::types::{GroupService, DEFAULT_GROUP_SHARES, HAS_PROFILE_GROUP_ID};
use crate::service::permission::types::PermissionService;
use crate::service::profile::types::ProfileService;
use crate::service::voting_config::types::VotingConfigService;
use crate::settings::{init_settings, set_settings, take_settings};
use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::time;
use ic_cdk::id;
use ic_cdk::storage::{stable_restore, stable_save};
use ic_cdk_macros::{heartbeat, init, post_upgrade, pre_upgrade, query};
use ic_cron::implement_cron;
use ic_event_hub::{implement_event_emitter, implement_subscribe, implement_unsubscribe};
use shared::time::secs;
use shared::types::wallet::Shares;

pub mod client;
pub mod common;
pub mod controller;
pub mod guards;
pub mod repository;
pub mod service;
pub mod settings;

#[derive(CandidType, Deserialize)]
pub struct InitRequest {
    pub history_ledger: Principal,
    pub wallet_creator: Principal,
    pub union_name: String,
    pub union_description: String,
}

#[init]
fn init(req: InitRequest) {
    init_settings(
        req.history_ledger,
        req.union_name,
        req.union_description,
        time(),
    );

    GroupService::init_has_profile_group();

    ProfileService::create_profile(
        req.wallet_creator,
        String::from("Wallet creator"),
        String::from("A person, who created this wallet"),
    )
    .expect("Unable to create wallet creator profile");

    PermissionService::init_allow_write_permissions(id());
    VotingConfigService::init_default_voting_configs();
    AccessConfigService::init_default_access_configs(req.wallet_creator);
}

#[post_upgrade]
fn post_upgrade_hook() {
    let (repos, cron, events, settings) = stable_restore().expect("Unable to stable restore");

    set_repositories(repos);
    set_settings(settings);
    _put_cron_state(cron);
    _put_event_hub_state(events);
}

#[pre_upgrade]
fn pre_upgrade_hook() {
    stable_save((
        take_repositories(),
        _take_cron_state(),
        _take_event_hub_state(),
        take_settings(),
    ))
    .expect("Unable to stable save");
}

implement_cron!();
// forms batches each 10 seconds, sized up to 2MB - this sets max program payload size for votings
//implement_event_emitter!(secs(10), 2 * 1024 * 1024);
implement_event_emitter!(secs(3), 2 * 1024 * 1024);

// TODO: only allow for gateway and history ledgers
implement_subscribe!();
implement_unsubscribe!();

#[heartbeat]
fn tick() {
    CronService::process_tasks();
    send_events();
}

#[query]
fn export_candid() -> String {
    include_str!("../can.did").to_string()
}
