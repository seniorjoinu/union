use crate::repository::permission::types::PermissionId;
use shared::mvc::ZERO_ID;
use shared::validation::ValidationError;

pub const ALLOW_ALL_PERMISSION_ID: PermissionId = ZERO_ID;

pub struct PermissionService;

#[derive(Debug)]
pub enum PermissionError {
    ValidationError(ValidationError),
    PermissionNotFound(PermissionId),
    UnableToEditAllowAllPermission,
    RelatedVotingConfigsExist,
    RelatedAccessConfigsExist,
}
