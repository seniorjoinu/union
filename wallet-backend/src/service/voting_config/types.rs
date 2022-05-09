use crate::repository::permission::types::PermissionId;
use shared::types::wallet::{GroupId, VotingConfigId};
use shared::validation::ValidationError;

pub const EMERGENCY_VOTING_CONFIG_ID: VotingConfigId = 0;
pub const FEEDBACK_VOTING_CONFIG_ID: VotingConfigId = 1;

pub struct VotingConfigService;

#[derive(Debug)]
pub enum VotingConfigError {
    ValidationError(ValidationError),
    PermissionDoesntExist(PermissionId),
    GroupDoesntExist(GroupId),
    UnableToEditDefaultVotingConfig,
    HasRelatedVotings,
    VotingConfigNotFound(VotingConfigId),
}
