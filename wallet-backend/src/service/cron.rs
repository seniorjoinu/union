use crate::repository::voting::types::{StartCondition, Voting, VotingStatus};
use crate::service::_voting as VotingService;
use crate::service::_voting_config as VotingConfigService;
use crate::{cron_enqueue, cron_ready_tasks, get_repositories};
use candid::{CandidType, Deserialize};
use ic_cdk::api::time;
use ic_cdk::print;
use ic_cron::types::{Iterations, SchedulingOptions, TaskId};
use shared::types::wallet::VotingId;

#[derive(CandidType, Deserialize)]
pub enum CronTaskKind {
    RoundStart(VotingId, u16),
    RoundEnd(VotingId, u16),
}

pub fn schedule_round_start(voting_id: &VotingId) {
    let voting = get_repositories().voting.get_voting_mut(voting_id).unwrap();

    let (round, delay_nano) = match &voting.status {
        VotingStatus::Created => {
            let delay = match &voting.start_condition {
                StartCondition::ExactDate(d) => {
                    let time = time();
                    assert!(time < *d);

                    *d - time
                }
            };

            (0, delay)
        }
        VotingStatus::PreRound(r) => {
            let voting_config =
                VotingConfigService::get_voting_config(&voting.voting_config_id).unwrap();

            (*r, voting_config.round.round_delay)
        }
        _ => unreachable!(),
    };

    let id = cron_enqueue(
        CronTaskKind::RoundStart(voting.id, round),
        SchedulingOptions {
            delay_nano,
            interval_nano: 0,
            iterations: Iterations::Exact(1),
        },
    )
    .unwrap();

    voting.set_task_id(id);
}

pub fn schedule_round_end(voting_id: &VotingId) {
    let voting = get_repositories().voting.get_voting_mut(voting_id).unwrap();

    match &voting.status {
        VotingStatus::Round(r) => {
            let voting_config =
                VotingConfigService::get_voting_config(&voting.voting_config_id).unwrap();

            let id = cron_enqueue(
                CronTaskKind::RoundStart(*voting_id, *r),
                SchedulingOptions {
                    delay_nano: voting_config.round.round_duration,
                    interval_nano: 0,
                    iterations: Iterations::Exact(1),
                },
            )
            .unwrap();

            voting.set_task_id(id);
        }
        _ => unreachable!(),
    };
}

pub fn process_tasks() {
    for task in cron_ready_tasks() {
        let kind: CronTaskKind = task.get_payload().expect("Unable to get task payload");

        match kind {
            CronTaskKind::RoundStart(voting_id, round) => {
                let voting = get_repositories()
                    .voting
                    .get_voting_mut(&voting_id)
                    .unwrap();

                match &voting.status {
                    VotingStatus::Created => {
                        get_repositories()
                            .voting
                            .finish_voting_fail(
                                &voting_id,
                                String::from("Voting wasn't approved in time"),
                                time(),
                            )
                            .unwrap();

                        // TODO: schedule garbage collect
                    }
                    VotingStatus::PreRound(r) => {
                        // if the task was scheduled to start exactly this round - start
                        if round == *r {
                            get_repositories()
                                .voting
                                .start_round(&voting_id, time())
                                .unwrap();

                            schedule_round_end(&voting_id);
                        } else {
                            // log - it is an outdated task
                            print(format!(
                                "Warning: round start task found at VotingStatus::PreRound({}) {} {}",
                                r, voting_id, round
                            ));
                        }
                    }
                    it => {
                        print(format!(
                            "Warning: round start task found at {:?}: {} {}",
                            it, voting_id, round
                        ));
                    }
                }
            }
            CronTaskKind::RoundEnd(voting_id, round) => {
                let voting = get_repositories()
                    .voting
                    .get_voting_mut(&voting_id)
                    .unwrap();

                match &voting.status {
                    VotingStatus::Round(r) => {
                        // if the task was scheduled to start exactly this round - end
                        if round == *r {
                            get_repositories()
                                .voting
                                .finish_voting_fail(
                                    &voting_id,
                                    String::from("Not enough votes"),
                                    time(),
                                )
                                .unwrap();
                        } else {
                            // log - it is an outdated task
                            print(format!(
                                "Warning: round end task found at VotingStatus::Round({}) {} {}",
                                r, voting_id, round
                            ));
                        }
                    }
                    it => {
                        print(format!(
                            "Warning: round end task found at {:?}: {} {}",
                            it, voting_id, round
                        ));
                    }
                }
            }
        }
    }
}
