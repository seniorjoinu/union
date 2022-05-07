use crate::repository::permission::types::PermissionId;
use shared::types::wallet::{AccessConfigId, GroupId, ProfileId};
use shared::validation::ValidationError;

pub const ALLOW_VOTE_ACCESS_CONFIG_ID: AccessConfigId = 0;

pub struct AccessConfigService;

#[derive(Debug)]
pub enum AccessConfigError {
    ValidationError(ValidationError),
    PermissionNotFound(PermissionId),
    GroupNotFound(GroupId),
    ProfileNotFound(ProfileId),
    AccessConfigNotFound(AccessConfigId),
    UnableToEditDefaultAccessConfig,
    CallerNotAllowed,
    InvalidProgram,
}
