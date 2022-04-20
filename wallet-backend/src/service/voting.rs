use crate::repository::get_repositories;
use crate::repository::voting::types::{
    ChoiceCreatePayload, StartCondition, VotingId, VotingRepositoryError,
};
use crate::repository::voting_config::types::{VotesFormula, VotingConfigId};
use crate::service::voting_config as VotingConfigService;
use crate::service::voting_config::VotingConfigServiceError;
use ic_cdk::api::time;
use ic_cdk::caller;

#[derive(Debug)]
pub enum VotingServiceError {
    RepositoryError(VotingRepositoryError),
    VotingConfigServiceError(VotingConfigServiceError),
}

#[inline(always)]
pub fn create_voting(
    voting_config_id: VotingConfigId,
    name: String,
    description: String,
    start_condition: StartCondition,
    votes_formula: VotesFormula,
    winners_need: usize,
    custom_choices: Vec<ChoiceCreatePayload>,
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
    new_custom_choices: Option<Vec<ChoiceCreatePayload>>,
) -> Result<(), VotingServiceError> {
    let voting = get_repositories()
        .voting
        .get_voting_cloned(voting_id)
        .map_err(VotingServiceError::RepositoryError)?;

    VotingConfigService::assert_can_update_voting(
        &voting,
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
