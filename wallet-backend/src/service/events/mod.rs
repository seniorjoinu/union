use crate::emit;
use crate::repository::nested_voting::model::NestedVoting;
use crate::repository::nested_voting::types::RemoteVotingId;
use crate::repository::voting::types::RoundResult;
use crate::service::events::events::{
    VotingRoundEndEvent, VotingRoundEndEventFilter, VotingRoundStartEvent,
    VotingRoundStartEventFilter,
};
use candid::Principal;
use ic_cdk::print;
use ic_cdk_macros::update;
use ic_event_hub::api::IEventHubClient;
use ic_event_hub::types::{CallbackInfo, Event, IEvent, IEventFilter, SubscribeRequest};
use shared::candid::{CandidCallResult, CandidRejectionCode};
use shared::mvc::{HasRepository, Model, Repository};
use shared::remote_call::{Program, ProgramExecutionResult};
use shared::types::wallet::{
    GroupId, PrincipalShareholder, ProfileActivatedEvent, ProfileCreatedEvent,
    ProgramExecutedEvent_0, ProgramExecutedEvent_1, ProgramExecutedEvent_2, ProgramExecutedWith,
    Shareholder, Shares, SharesMoveEvent, TotalSupplyUpdatedEvent,
};

pub mod events;

pub struct EventsService;

impl EventsService {
    pub fn emit_program_executed_event(
        initiator: Principal,
        with: ProgramExecutedWith,
        program: Program,
        result: ProgramExecutionResult,
        timestamp: u64,
    ) {
        print("emit_program_executed_event()");

        emit(ProgramExecutedEvent_0 {
            timestamp,
            initiator,
            with,
        })
        .expect("Unable to emit program executed event part 1: ");
        emit(ProgramExecutedEvent_1 { timestamp, program })
            .expect("Unable to emit program executed event part 2: ");
        emit(ProgramExecutedEvent_2 { timestamp, result })
            .expect("Unable to emit program executed event part 3: ");
    }

    pub fn emit_shares_mint_event(
        group_id: GroupId,
        to: Principal,
        qty: Shares,
        to_new_balance: Shares,
        total_supply: Shares,
        timestamp: u64,
    ) {
        print("emit_shares_mint_event()");

        emit(SharesMoveEvent {
            group_id,
            qty,
            timestamp,
            to: Shareholder::Principal(PrincipalShareholder {
                principal_id: to,
                new_balance: to_new_balance,
            }),
            from: Shareholder::Void,
        })
        .expect("Unable to emit shares move event: ");
        emit(TotalSupplyUpdatedEvent {
            group_id,
            timestamp,
            total_supply,
        })
        .expect("Unable to emit total supply updated event: ");
    }

    pub fn emit_shares_burn_event(
        group_id: GroupId,
        from: Principal,
        qty: Shares,
        from_new_balance: Shares,
        total_supply: Shares,
        timestamp: u64,
    ) {
        print("emit_shares_burn_event()");

        emit(SharesMoveEvent {
            group_id,
            qty,
            timestamp,
            from: Shareholder::Principal(PrincipalShareholder {
                principal_id: from,
                new_balance: from_new_balance,
            }),
            to: Shareholder::Void,
        })
        .expect("Unable to emit shares move event: ");
        emit(TotalSupplyUpdatedEvent {
            group_id,
            timestamp,
            total_supply,
        })
        .expect("Unable to emit total supply updated event: ");
    }

    pub fn emit_shares_transfer_event(
        group_id: GroupId,
        from: Principal,
        to: Principal,
        qty: Shares,
        from_new_balance: Shares,
        to_new_balance: Shares,
        timestamp: u64,
    ) {
        print("emit_shares_transfer_event()");

        emit(SharesMoveEvent {
            group_id,
            qty,
            timestamp,
            to: Shareholder::Principal(PrincipalShareholder {
                principal_id: to,
                new_balance: to_new_balance,
            }),
            from: Shareholder::Principal(PrincipalShareholder {
                principal_id: from,
                new_balance: from_new_balance,
            }),
        })
        .expect("Unable to emit shares move event: ");
    }

    pub async fn subscribe_to_voting_updates(
        remote_union_id: Principal,
        remote_voting_id: RemoteVotingId,
    ) -> Result<(), String> {
        let f1 = VotingRoundStartEventFilter {
            voting_id: Some(remote_voting_id),
        };

        let f2 = VotingRoundEndEventFilter {
            voting_id: Some(remote_voting_id),
        };

        remote_union_id
            .subscribe(SubscribeRequest {
                callbacks: vec![
                    CallbackInfo {
                        method_name: String::from("process_events"),
                        filter: f1.to_event_filter(),
                    },
                    CallbackInfo {
                        method_name: String::from("process_events"),
                        filter: f2.to_event_filter(),
                    },
                ],
            })
            .await
            .map(|_| ())
            .map_err(|(_, m)| m)
    }

    pub fn emit_profile_created_event(owner: Principal) {
        /*emit(ProfileCreatedEvent {
            profile_owner: owner,
        });*/
    }

    pub fn emit_profile_activated_event(owner: Principal) {
        /*emit(ProfileActivatedEvent {
            profile_owner: owner,
        });*/
    }
}

#[update]
fn process_events(events: Vec<Event>) {
    print("process_events() called");

    for event in events {
        match event.get_name().as_str() {
            "VotingRoundStartEvent" => {
                let ev: VotingRoundStartEvent = VotingRoundStartEvent::from_event(event);

                if let Some(mut voting) =
                    NestedVoting::repo().get_by_remote_voting_id(&ev.voting_id)
                {
                    voting.unfreeze();

                    emit(VotingRoundStartEvent {
                        voting_id: RemoteVotingId::Nested(voting.get_id().unwrap()),
                    })
                    .expect("Unable to emit voting round start event: ");

                    NestedVoting::repo().save(voting);
                }
            }
            "VotingRoundEndEvent" => {
                let ev: VotingRoundEndEvent = VotingRoundEndEvent::from_event(event);

                if let Some(mut voting) =
                    NestedVoting::repo().get_by_remote_voting_id(&ev.voting_id)
                {
                    voting.freeze();

                    if let Some(winner) = ev.winners {
                        let mut round_result = RoundResult::new(winner.get_round());

                        for choice_id in voting.get_choices().clone() {
                            let remote_choice_id =
                                voting.get_choices_map().get(&choice_id).cloned().unwrap();
                            if winner.get_choices().contains(&remote_choice_id) {
                                voting.remove_choice(&choice_id);
                                round_result.add_choice(choice_id);
                            }
                        }

                        emit(VotingRoundEndEvent {
                            voting_id: RemoteVotingId::Nested(voting.get_id().unwrap()),
                            winners: Some(round_result.clone()),
                            losers: None,
                        })
                        .expect("Unable to emit voting round end event: ");

                        voting.add_winner(round_result);
                        return;
                    }

                    if let Some(loser) = ev.losers {
                        let mut round_result = RoundResult::new(loser.get_round());

                        for choice_id in voting.get_choices().clone() {
                            let remote_choice_id =
                                voting.get_choices_map().get(&choice_id).cloned().unwrap();
                            if loser.get_choices().contains(&remote_choice_id) {
                                voting.remove_choice(&choice_id);
                                round_result.add_choice(choice_id);
                            }
                        }

                        emit(VotingRoundEndEvent {
                            voting_id: RemoteVotingId::Nested(voting.get_id().unwrap()),
                            winners: None,
                            losers: Some(round_result.clone()),
                        })
                        .expect("Unable to emit voting round end event: ");

                        voting.add_loser(round_result);
                    }

                    NestedVoting::repo().save(voting);
                }
            }
            s => print(format!("Invalid event type '{}'", s)),
        }
    }
}
