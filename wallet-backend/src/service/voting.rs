use crate::repository::get_repositories;
use crate::repository::voting::types::{
    StartCondition, Vote, VoteType, Voter, VotingRepositoryError,
};
use crate::repository::voting_config::types::VotesFormula;
use crate::service::group::DEFAULT_SHARES;
use crate::service::voting_config as VotingConfigService;
use crate::service::voting_config::VotingConfigServiceError;
use ic_cdk::api::time;
use ic_cdk::caller;
use shared::types::wallet::{ChoiceExternal, Shares, VotingConfigId, VotingId};

#[derive(Debug)]
pub enum VotingServiceError {
    RepositoryError(VotingRepositoryError),
    VotingConfigServiceError(VotingConfigServiceError),
    NotEnoughShares,
    InvalidVoteCaster,
}

pub fn create_voting(
    voting_config_id: VotingConfigId,
    name: String,
    description: String,
    start_condition: StartCondition,
    votes_formula: VotesFormula,
    winners_need: usize,
    custom_choices: Vec<ChoiceExternal>,
) -> Result<VotingId, VotingServiceError> {
    VotingConfigService::assert_can_create_voting(
        &voting_config_id,
        &votes_formula,
        winners_need,
        &custom_choices,
        caller(),
    )
    .map_err(VotingServiceError::VotingConfigServiceError)?;

    get_repositories()
        .voting
        .create_voting(
            voting_config_id,
            name,
            description,
            start_condition,
            votes_formula,
            winners_need,
            custom_choices,
            caller(),
            time(),
        )
        .map_err(VotingServiceError::RepositoryError)
}

#[inline(always)]
pub fn update_voting(
    voting_id: &VotingId,
    new_name: Option<String>,
    new_description: Option<String>,
    new_start_condition: Option<StartCondition>,
    new_votes_formula: Option<VotesFormula>,
    new_winners_need: Option<usize>,
    new_custom_choices: Option<Vec<ChoiceExternal>>,
) -> Result<(), VotingServiceError> {
    let voting = get_repositories()
        .voting
        .get_voting(voting_id)
        .map_err(VotingServiceError::RepositoryError)?;

    VotingConfigService::assert_can_update_voting(
        voting,
        &new_votes_formula,
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
            new_votes_formula,
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

pub fn cast_vote(voting_id: &VotingId, vote: Vote) -> Result<(), VotingServiceError> {
    let voting = get_repositories()
        .voting
        .get_voting(voting_id)
        .map_err(VotingServiceError::RepositoryError)?;

    let (voter_shares, gop_total_supply) = match &vote.voter {
        Voter::Group((_, p)) => {
            if p != &caller() {
                return Err(VotingServiceError::InvalidVoteCaster);
            }

            // TODO: fetch caller's real shares from the ledger
            (Shares::default(), Shares::default())
        }
        Voter::Profile(p) => {
            if p != &caller() {
                return Err(VotingServiceError::InvalidVoteCaster);
            }

            (Shares::from(DEFAULT_SHARES), Shares::from(DEFAULT_SHARES))
        }
    };

    // check if the voter have enough shares for their vote
    match &vote.vote_type {
        VoteType::Rejection(shares) => {
            if shares.0 < voter_shares.0 {
                return Err(VotingServiceError::NotEnoughShares);
            }
        }
        VoteType::Custom(m) => {
            let mut sum = Shares::default();
            for (_, s) in m {
                sum += s.clone();
            }

            if sum < voter_shares {
                return Err(VotingServiceError::NotEnoughShares);
            }
        }
    };

    VotingConfigService::assert_can_vote(voting, &vote.voter)
        .map_err(VotingServiceError::VotingConfigServiceError)?;

    get_repositories()
        .voting
        .cast_vote(voting_id, vote, gop_total_supply, time())
        .map_err(VotingServiceError::RepositoryError)?;

    // TODO: process voting status

    Ok(())
}

// TODO: allow subsequent choice appending
