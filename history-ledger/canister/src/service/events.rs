use crate::repository::program_execution::model::ProgramExecutionEntry;
use crate::repository::shares_move::model::SharesMoveEntry;
use candid::Principal;
use ic_cdk::print;
use ic_event_hub::api::IEventHubClient;
use ic_event_hub::types::{CallbackInfo, Event, IEvent, IEventFilter, SubscribeRequest};
use shared::mvc::{HasRepository, Repository};
use shared::types::wallet::{
    ProgramExecutedEvent_0, ProgramExecutedEvent_0Filter, ProgramExecutedEvent_1,
    ProgramExecutedEvent_1Filter, ProgramExecutedEvent_2, ProgramExecutedEvent_2Filter,
    SharesMoveEvent, SharesMoveEventFilter,
};

pub struct EventsService;

impl EventsService {
    pub async fn subscribe_to_wallet_events(wallet_id: Principal) {
        let f1 = SharesMoveEventFilter {};
        let f2 = ProgramExecutedEvent_0Filter {};
        let f3 = ProgramExecutedEvent_1Filter {};
        let f4 = ProgramExecutedEvent_2Filter {};

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
                    let it = SharesMoveEntry::from_event(ev);

                    SharesMoveEntry::repo().save(it);
                }
                "ProgramExecutedEvent_0" => {
                    let ev: ProgramExecutedEvent_0 = ProgramExecutedEvent_0::from_event(event);
                    let it = ProgramExecutionEntry::from_event(ev);
                    
                    ProgramExecutionEntry::repo().save(it);
                }
                "ProgramExecutedEvent_1" => {
                    let ev: ProgramExecutedEvent_1 = ProgramExecutedEvent_1::from_event(event);
                    if let Some(mut it) = ProgramExecutionEntry::repo().get(&ev.timestamp) {
                        it.set_program(ev.program);
                        ProgramExecutionEntry::repo().save(it);
                    } else {
                        print(format!(
                            "ERROR: Unable to find a previous event for {}",
                            ev.timestamp
                        ))
                    }
                }
                "ProgramExecutedEvent_2" => {
                    let ev: ProgramExecutedEvent_2 = ProgramExecutedEvent_2::from_event(event);

                    if let Some(mut it) = ProgramExecutionEntry::repo().get(&ev.timestamp) {
                        it.set_result(ev.result);
                        ProgramExecutionEntry::repo().save(it);
                    } else {
                        print(format!(
                            "ERROR: Unable to find a previous event for {}",
                            ev.timestamp
                        ))
                    }
                }
                _ => print(format!("Unknown event {:?}", event)),
            }
        }
    }
}
