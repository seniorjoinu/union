use shared::validation::ValidationError;
use crate::repository::permission::types::PermissionId;

pub const ALLOW_ALL_PERMISSION_ID: PermissionId = PermissionId::default();

pub struct PermissionService;

#[derive(Debug)]
pub enum PermissionError {
    ValidationError(ValidationError),
    PermissionNotFound(PermissionId),
    UnableToEditAllowAllPermission,
}
