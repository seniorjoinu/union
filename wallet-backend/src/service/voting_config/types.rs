use crate::repository::permission::types::PermissionId;
use shared::types::wallet::{GroupId, ProfileId, VotingConfigId};
use shared::validation::ValidationError;

pub const DEFAULT_VOTING_CONFIG_ID: VotingConfigId = 0;

pub struct VotingConfigService;

#[derive(Debug)]
pub enum VotingConfigError {
    ValidationError(ValidationError),
    PermissionNotExists(PermissionId),
    GroupNotExists(GroupId),
    ProfileNotExists(ProfileId),
    UnableToEditDefaultVotingConfig,
    HasRelatedVotings,
    VotingConfigNotFound(VotingConfigId)
}
