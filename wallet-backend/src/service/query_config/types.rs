use crate::repository::permission::types::PermissionId;
use crate::repository::query_config::types::QueryConfigId;
use shared::types::wallet::{GroupId, ProfileId};
use shared::validation::ValidationError;

pub struct QueryConfigService;

#[derive(Debug)]
pub enum QueryConfigError {
    ValidationError(ValidationError),
    PermissionNotFound(PermissionId),
    GroupNotFound(GroupId),
    ProfileNotFound(ProfileId),
    QueryConfigNotFound(QueryConfigId),
    UnableToDeleteTheLastQueryConfig,
    QueryCallerNotAllowed,
}
