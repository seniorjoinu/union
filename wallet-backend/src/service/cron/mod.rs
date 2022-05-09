use crate::repository::choice::model::Choice;
use crate::repository::voting::model::Voting;
use crate::repository::voting_config::model::VotingConfig;
use crate::service::events::EventsService;
use crate::service::voting::types::VotingService;
use crate::{cron_enqueue, cron_ready_tasks};
use candid::{CandidType, Deserialize};
use ic_cdk::api::time;
use ic_cdk::spawn;
use ic_cron::types::{Iterations, SchedulingOptions};
use shared::mvc::{HasRepository, Model, Repository};
use shared::types::wallet::{ProgramExecutedWith, VotingId};

#[derive(CandidType, Deserialize)]
pub enum CronTaskKind {
    RoundStart(VotingId),
    RoundEnd(VotingId),
    VotingExecution(VotingId),
}

pub struct CronService;

impl CronService {
    pub fn schedule_round_start(voting: &mut Voting, vc: &VotingConfig, timestamp: u64) {
        let task_id = cron_enqueue(
            CronTaskKind::RoundStart(voting.get_id().unwrap()),
            SchedulingOptions {
                delay_nano: vc.get_round_settings().round_delay,
                interval_nano: 0,
                iterations: Iterations::Exact(1),
            },
        )
        .expect("Unable to schedule a task");

        voting.set_cron_task(task_id, timestamp);
    }

    pub fn schedule_round_end(voting: &mut Voting, vc: &VotingConfig, timestamp: u64) {
        let task_id = cron_enqueue(
            CronTaskKind::RoundEnd(voting.get_id().unwrap()),
            SchedulingOptions {
                delay_nano: vc.get_round_settings().round_duration,
                interval_nano: 0,
                iterations: Iterations::Exact(1),
            },
        )
        .expect("Unable to schedule a task");

        voting.set_cron_task(task_id, timestamp);
    }

    pub fn schedule_voting_execution(voting: &mut Voting, timestamp: u64) {
        let task_id = cron_enqueue(
            CronTaskKind::VotingExecution(voting.get_id().unwrap()),
            SchedulingOptions {
                delay_nano: 0,
                interval_nano: 0,
                iterations: Iterations::Exact(1),
            },
        )
        .expect("Unable to schedule a task");

        voting.set_cron_task(task_id, timestamp);
    }

    pub fn process_tasks() {
        let timestamp = time();

        for task in cron_ready_tasks() {
            let kind: CronTaskKind = task.get_payload().expect("Unable to get task payload");

            match kind {
                CronTaskKind::RoundStart(voting_id) => {
                    let mut voting = Voting::repo().get(&voting_id).unwrap();
                    let vc = VotingConfig::repo()
                        .get(voting.get_voting_config_id())
                        .unwrap();

                    voting.start_round(timestamp);
                    CronService::schedule_round_end(&mut voting, &vc, timestamp);

                    Voting::repo().save(voting);
                }
                CronTaskKind::RoundEnd(voting_id) => {
                    let mut voting = Voting::repo().get(&voting_id).unwrap();
                    let vc = VotingConfig::repo()
                        .get(voting.get_voting_config_id())
                        .unwrap();

                    VotingService::try_finish_voting(&mut voting, &vc, timestamp);

                    Voting::repo().save(voting);
                }
                CronTaskKind::VotingExecution(voting_id) => spawn(async move {
                    let voting = Voting::repo().get(&voting_id).unwrap();

                    for result in voting.get_winners() {
                        for choice in result
                            .get_choices()
                            .iter()
                            .map(|id| Choice::repo().get(id).unwrap())
                        {
                            let timestamp = time();
                            let program = choice.get_program().clone();
                            let result = program.execute().await;

                            EventsService::emit_program_executed_event(
                                voting.get_proposer(),
                                ProgramExecutedWith::WithVotingConfig(
                                    *voting.get_voting_config_id(),
                                ),
                                program,
                                result,
                                timestamp,
                            );
                        }
                    }
                }),
            };
        }
    }
}
