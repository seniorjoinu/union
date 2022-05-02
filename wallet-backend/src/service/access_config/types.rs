use crate::repository::permission::types::PermissionId;
use shared::types::wallet::{GroupId, ProfileId};
use shared::validation::ValidationError;
use crate::repository::access_config::types::AccessConfigId;

pub struct AccessConfigService;

#[derive(Debug)]
pub enum AccessConfigError {
    ValidationError(ValidationError),
    PermissionNotFound(PermissionId),
    GroupNotFound(GroupId),
    ProfileNotFound(ProfileId),
    AccessConfigNotFound(AccessConfigId),
    UnableToDeleteTheLastAccessConfig,
    QueryCallerNotAllowed,
}
