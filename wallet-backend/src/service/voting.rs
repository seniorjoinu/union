use crate::repository::get_repositories;
use crate::repository::voting::types::{
    StartCondition, Vote, VoteType, Voter, VotingRepositoryError, VotingStatus,
};
use crate::service::cron as CronService;
use crate::service::history_ledger as HistoryLedgerService;
use crate::service::history_ledger::HistoryLedgerServiceError;
use crate::service::voting_config as VotingConfigService;
use crate::service::voting_config::VotingConfigServiceError;
use ic_cdk::api::time;
use ic_cdk::caller;
use shared::types::wallet::{ChoiceView, Shares, VotingConfigId, VotingId};

#[derive(Debug)]
pub enum VotingServiceError {
    RepositoryError(VotingRepositoryError),
    VotingConfigServiceError(VotingConfigServiceError),
    HistoryLedgerServiceError(HistoryLedgerServiceError),
    NotEnoughShares,
    InvalidVoteCaster,
}

pub fn create_voting(
    voting_config_id: VotingConfigId,
    name: String,
    description: String,
    start_condition: StartCondition,
    winners_need: usize,
    custom_choices: Vec<ChoiceView>,
) -> Result<VotingId, VotingServiceError> {
    VotingConfigService::assert_can_create_voting(
        &voting_config_id,
        winners_need,
        &custom_choices,
        caller(),
    )
    .map_err(VotingServiceError::VotingConfigServiceError)?;

    let id = get_repositories()
        .voting
        .create_voting(
            voting_config_id,
            name,
            description,
            start_condition,
            winners_need,
            custom_choices,
            caller(),
            time(),
        )
        .map_err(VotingServiceError::RepositoryError)?;

    let task_id = CronService::schedule_round_start(&id);

    let voting = get_repositories()
        .voting
        .get_voting_mut(&id)
        .map_err(VotingServiceError::RepositoryError)?;

    voting.set_task_id(task_id);

    Ok(id)
}

#[inline(always)]
pub fn update_voting(
    voting_id: &VotingId,
    new_name: Option<String>,
    new_description: Option<String>,
    new_start_condition: Option<StartCondition>,
    new_winners_need: Option<usize>,
    new_custom_choices: Option<Vec<ChoiceView>>,
) -> Result<(), VotingServiceError> {
    let voting = get_repositories()
        .voting
        .get_voting(voting_id)
        .map_err(VotingServiceError::RepositoryError)?;

    VotingConfigService::assert_can_update_voting(
        voting,
        new_winners_need,
        &new_custom_choices,
        caller(),
    )
    .map_err(VotingServiceError::VotingConfigServiceError)?;

    get_repositories()
        .voting
        .update_voting(
            voting_id,
            new_name,
            new_description,
            new_start_condition,
            new_winners_need,
            new_custom_choices,
            time(),
        )
        .map_err(VotingServiceError::RepositoryError)
}

pub fn delete_voting(voting_id: &VotingId) -> Result<(), VotingServiceError> {
    let voting = get_repositories()
        .voting
        .get_voting(voting_id)
        .map_err(VotingServiceError::RepositoryError)?;

    VotingConfigService::assert_can_delete_voting(voting, caller())
        .map_err(VotingServiceError::VotingConfigServiceError)?;

    get_repositories()
        .voting
        .delete_voting(voting_id)
        .map(|_| ())
        .map_err(VotingServiceError::RepositoryError)
}

pub async fn cast_vote(voting_id: &VotingId, vote: Vote) -> Result<(), VotingServiceError> {
    let voting = get_repositories()
        .voting
        .get_voting(voting_id)
        .map_err(VotingServiceError::RepositoryError)?;

    let zero_shares = Shares::default();

    let (voter_shares, gop_total_supply) = match &vote.voter {
        Voter::Group((g, p)) => {
            if p != &caller() {
                return Err(VotingServiceError::InvalidVoteCaster);
            }

            let shares_info_opt = HistoryLedgerService::get_shares_info_of_at(*g, *p, time())
                .await
                .map_err(VotingServiceError::HistoryLedgerServiceError)?;

            if let Some(shares_info) = shares_info_opt {
                (shares_info.balance, shares_info.total_supply)
            } else {
                return Err(VotingServiceError::NotEnoughShares);
            }
        }
        Voter::Profile(p) => {
            if p != &caller() {
                return Err(VotingServiceError::InvalidVoteCaster);
            }

            (zero_shares.clone(), zero_shares.clone())
        }
    };

    // check if the voter have enough shares for their vote
    match &vote.vote_type {
        VoteType::Rejection(shares) => {
            if shares.0 < voter_shares.0 || shares == &zero_shares {
                return Err(VotingServiceError::NotEnoughShares);
            }
        }
        VoteType::Custom(m) => {
            let mut sum = Shares::default();
            for (_, s) in m {
                sum += s.clone();
            }

            if sum < voter_shares || sum == zero_shares {
                return Err(VotingServiceError::NotEnoughShares);
            }
        }
    };

    VotingConfigService::assert_can_vote(voting, &vote.voter)
        .map_err(VotingServiceError::VotingConfigServiceError)?;

    let voting = get_repositories()
        .voting
        .cast_vote(voting_id, vote, gop_total_supply, time())
        .map_err(VotingServiceError::RepositoryError)?;

    try_progress_voting_after_vote_casting(voting_id);

    Ok(())
}

fn try_progress_voting_after_vote_casting(voting_id: &VotingId) {
    let voting = get_repositories().voting.get_voting_mut(voting_id).unwrap();

    if !matches!(
        voting.status,
        VotingStatus::Created | VotingStatus::Round(_)
    ) {
        unreachable!();
    }

    let voting_config = get_repositories()
        .voting_config
        .get_voting_config_cloned(&voting.voting_config_id)
        .unwrap();

    if voting_config.rejection_reached(voting) {
        get_repositories()
            .voting
            .reject_voting(voting_id, time())
            .unwrap();

        // TODO: schedule garbage collection

        return;
    }

    match &voting.status {
        VotingStatus::Created => {
            if voting_config.approval_reached(voting) {
                get_repositories()
                    .voting
                    .approve_voting(voting_id, time())
                    .unwrap();

                // TODO: schedule next round by approval delay

                return;
            }
        }
        VotingStatus::Round(r) => {
            if voting_config.quorum_reached(voting) {
                let winners = voting_config.win_reached(voting);
                if !winners.is_empty() {
                    let another_round = get_repositories()
                        .voting
                        .try_finish_by_vote_casting(voting_id, Some(winners), None, time())
                        .unwrap();

                    voting.deschedule_task_id();

                    if another_round {
                        CronService::schedule_round_start(voting_id);
                    }
                }

                let next_round = voting_config.next_round_reached(voting);
                if !next_round.is_empty() {
                    let another_round = get_repositories()
                        .voting
                        .try_finish_by_vote_casting(voting_id, None, Some(next_round), time())
                        .unwrap();

                    voting.deschedule_task_id();

                    if another_round {
                        CronService::schedule_round_start(voting_id);
                    }
                }
            }
        }
        _ => unreachable!(),
    }
}

// TODO: allow subsequent choice appending
