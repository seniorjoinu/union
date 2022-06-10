use crate::repository::{set_repositories, take_repositories};
use crate::service::cron::CronService;
use candid::Principal;
use ic_cdk::storage::{stable_restore, stable_save};
use ic_cdk_macros::{heartbeat, init, query, post_upgrade, pre_upgrade};
use ic_cron::implement_cron;

mod controller;
mod repository;
mod service;

implement_cron!();

#[init]
fn init(wallet_id: Principal) {
    CronService::schedule_wallet_events_subscription(wallet_id);
}

#[heartbeat]
fn tick() {
    CronService::process_cron_tasks()
}

#[post_upgrade]
fn post_upgrade_hook() {
    let (repos, cron) = stable_restore().expect("Unable to stable restore");

    set_repositories(repos);
    _put_cron_state(cron);
}

#[pre_upgrade]
fn pre_upgrade_hook() {
    stable_save((take_repositories(), _take_cron_state())).expect("Unable to stable save");
}

#[query]
fn export_candid() -> String {
    include_str!("../can.did").to_string()
}