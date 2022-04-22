use crate::repository::get_repositories;
use candid::Principal;
use ic_cdk::print;
use ic_event_hub::api::IEventHubClient;
use ic_event_hub::types::{CallbackInfo, Event, IEvent, IEventFilter, SubscribeRequest};
use shared::types::wallet::{
    SharesMoveEvent, SharesMoveEventFilter, VotingExecutedMetaEvent, VotingExecutedMetaEventFilter,
    VotingExecutedResultEvent, VotingExecutedResultEventFilter, VotingExecutedWinnerEvent,
    VotingExecutedWinnerEventFilter,
};

pub async fn subscribe_to_wallet_events(wallet_id: Principal) {
    let f1 = SharesMoveEventFilter {};
    let f2 = VotingExecutedMetaEventFilter {};
    let f3 = VotingExecutedWinnerEventFilter {};
    let f4 = VotingExecutedResultEventFilter {};

    // Warning! Method name should follow the name of the CONTROLLER method
    wallet_id
        .subscribe(SubscribeRequest {
            callbacks: vec![
                CallbackInfo {
                    filter: f1.to_event_filter(),
                    method_name: String::from("process_events"),
                },
                CallbackInfo {
                    filter: f2.to_event_filter(),
                    method_name: String::from("process_events"),
                },
                CallbackInfo {
                    filter: f3.to_event_filter(),
                    method_name: String::from("process_events"),
                },
                CallbackInfo {
                    filter: f4.to_event_filter(),
                    method_name: String::from("process_events"),
                },
            ],
        })
        .await
        .expect("Unable to subscribe to wallet events")
}

// TODO: don't process events when there is a new ledger exists
// TODO: only process events from your wallet
pub fn process_events(events: Vec<Event>) {
    for event in events {
        match event.get_name().as_str() {
            "SharesMoveEvent" => {
                let ev: SharesMoveEvent = SharesMoveEvent::from_event(event);

                get_repositories().shares_move.add_entry(ev);
            }
            "VotingExecutedMetaEvent" => {
                let ev: VotingExecutedMetaEvent = VotingExecutedMetaEvent::from_event(event);

                let res = get_repositories().voting_execution.push(
                    ev.voting_id,
                    ev.voting_config_id,
                    ev.name,
                    ev.description,
                    ev.timestamp,
                    ev.winners_count,
                );

                if let Err(e) = res {
                    print(format!(
                        "Error during VotingExecutedMetaEvent processing: {:?}",
                        e
                    ));
                }
            }
            "VotingExecutedWinnerEvent" => {
                let ev: VotingExecutedWinnerEvent = VotingExecutedWinnerEvent::from_event(event);

                let res = get_repositories().voting_execution.add_winner(
                    ev.voting_id,
                    ev.choice_id,
                    ev.choice,
                );

                if let Err(e) = res {
                    print(format!(
                        "Error during VotingExecutedWinnerEvent processing: {:?}",
                        e
                    ));
                }
            }
            "VotingExecutedResultEvent" => {
                let ev: VotingExecutedResultEvent = VotingExecutedResultEvent::from_event(event);

                let res = get_repositories().voting_execution.add_result(
                    ev.voting_id,
                    ev.choice_id,
                    ev.result,
                );

                if let Err(e) = res {
                    print(format!(
                        "Error during VotingExecutedResultEvent processing: {:?}",
                        e
                    ));
                }
            }
            _ => unreachable!("Unknown event {:?}", event),
        }
    }
}
