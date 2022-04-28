use crate::service::events::EventsService;
use ic_cdk_macros::update;
use ic_event_hub::types::Event;

#[update]
fn process_events(events: Vec<Event>) {
    EventsService::process_events(events);
}
