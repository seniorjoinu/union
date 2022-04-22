use candid::{Principal, CandidType, Deserialize};
use ic_cron::types::{Iterations, SchedulingOptions};
use crate::{cron_enqueue, cron_ready_tasks};
use crate::service::events as EventsService;

#[derive(CandidType, Deserialize)]
enum CronTaskKind {
    SubscribeToWalletEvents(Principal),
}

pub fn schedule_wallet_events_subscription(wallet_id: Principal) {
    cron_enqueue(
        CronTaskKind::SubscribeToWalletEvents(wallet_id),
        SchedulingOptions {
            delay_nano: 0,
            interval_nano: 0,
            iterations: Iterations::Exact(1),
        }
    ).expect("Unable to enqueue cron task for wallet events subscription");
}

pub fn process_cron_tasks() {
    for task in cron_ready_tasks() {
        match task.get_payload::<CronTaskKind>().expect("Invalid cron task") {
            CronTaskKind::SubscribeToWalletEvents(p) => EventsService::subscribe_to_wallet_events(p)
        };
    }
}