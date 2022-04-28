use shared::types::wallet::{GroupId, ProfileId};
use shared::validation::ValidationError;
use crate::repository::permission::types::PermissionId;

pub struct VotingConfigService;

#[derive(Debug)]
pub enum VotingConfigError {
    ValidationError(ValidationError),
    PermissionNotExists(PermissionId),
    GroupNotExists(GroupId),
    ProfileNotExists(ProfileId),
}