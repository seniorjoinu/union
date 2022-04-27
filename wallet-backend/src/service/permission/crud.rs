use shared::mvc::{HasRepository, Repository};
use crate::repository::permission::model::Permission;
use crate::repository::permission::types::PermissionId;
use crate::service::permission::types::{PermissionError, PermissionService};

impl PermissionService {
    pub fn delete_permission(id: &PermissionId) -> Result<Permission, PermissionError> {
        PermissionService::assert_not_allow_all_permission(*id)?;
        
        // TODO: check for existing voting and query configs
        
        Permission::repo().delete(id)
            .ok_or(PermissionError::PermissionNotFound(*id))
    }
}