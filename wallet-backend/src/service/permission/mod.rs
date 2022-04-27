use crate::repository::permission::model::Permission;
use crate::repository::permission::types::{PermissionId, PermissionScope};
use crate::service::permission::types::{PermissionService, ALLOW_ALL_PERMISSION_ID, PermissionError};
use shared::mvc::{HasRepository, Repository};

pub mod crud;
pub mod types;

impl PermissionService {
    pub fn init_allow_all_permission() {
        let permission = Permission::new(
            String::from("Allow all"),
            String::from("Non-deletable default permission. Allows calls to ANY method."),
            vec![],
            PermissionScope::Blacklist,
        )
        .unwrap();
        let id = Permission::repo().save(permission);

        assert_eq!(id, ALLOW_ALL_PERMISSION_ID);
    }
    
    pub fn assert_not_allow_all_permission(id: PermissionId) -> Result<(), PermissionError> {
        if id == ALLOW_ALL_PERMISSION_ID {
            Err(PermissionError::UnableToEditAllowAllPermission)
        } else {
            Ok(())
        }
    }
}
