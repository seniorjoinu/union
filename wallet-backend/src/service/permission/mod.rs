use crate::repository::permission::model::Permission;
use crate::repository::permission::types::{PermissionId, PermissionTarget};
use crate::service::permission::types::{
    PermissionError, PermissionService, ALLOW_ALL_PERMISSION_ID,
};
use candid::Principal;
use shared::mvc::{HasRepository, Repository};

pub mod crud;
pub mod types;

impl PermissionService {
    pub fn init_allow_all_permission(this_canister_id: Principal) {
        let permission = Permission::new(
            String::from("Allow all"),
            String::from("Non-deletable default permission. Allows calls to ANY method of this union."),
            vec![PermissionTarget::Canister(this_canister_id)],
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
