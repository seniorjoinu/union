use crate::repository::permission::types::PermissionId;
use shared::validation::ValidationError;

pub const ALLOW_ALL_PERMISSION_ID: PermissionId = PermissionId::default();

pub struct PermissionService;

#[derive(Debug)]
pub enum PermissionError {
    ValidationError(ValidationError),
    PermissionNotFound(PermissionId),
    UnableToEditAllowAllPermission,
    RelatedVotingConfigsExist,
    RelatedAccessConfigsExist,
}
