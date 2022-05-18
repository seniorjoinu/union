use shared::validation::ValidationError;
use crate::repository::nested_voting_config::types::NestedVotingConfigId;
use crate::service::group::types::GroupError;

pub struct NestedVotingConfigService;

#[derive(Debug)]
pub enum NestedVotingConfigError {
    ValidationError(ValidationError),
    GroupError(GroupError),
    NestedVotingConfigNotFound(NestedVotingConfigId),
}