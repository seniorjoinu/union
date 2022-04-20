use crate::common::utils::{Page, PageRequest};
use crate::repository::get_repositories;
use crate::repository::permission::types::{
    Permission, PermissionFilter, PermissionId, PermissionRepositoryError, PermissionScope,
    PermissionTarget,
};

pub const DEFAULT_PERMISSION_ID: PermissionId = 0;

#[derive(Debug)]
pub enum PermissionServiceError {
    RepositoryError(PermissionRepositoryError),
    UnableToEditDefaultPermission,
}

pub fn _init_default_permission() {
    let id = get_repositories()
        .permission
        .create_permission(
            String::from("Allow all"),
            Vec::new(),
            PermissionScope::Blacklist,
        )
        .unwrap();

    assert_eq!(id, DEFAULT_PERMISSION_ID);
}

#[inline(always)]
pub fn create_permission(
    name: String,
    targets: Vec<PermissionTarget>,
    scope: PermissionScope,
) -> Result<PermissionId, PermissionServiceError> {
    get_repositories()
        .permission
        .create_permission(name, targets, scope)
        .map_err(PermissionServiceError::RepositoryError)
}

#[inline(always)]
pub fn update_permission(
    permission_id: PermissionId,
    new_name: Option<String>,
    new_targets: Option<Vec<PermissionTarget>>,
    new_scope: Option<PermissionScope>,
) -> Result<(), PermissionServiceError> {
    assert_permission_id(permission_id)?;

    get_repositories()
        .permission
        .update_permission(&permission_id, new_name, new_targets, new_scope)
        .map_err(PermissionServiceError::RepositoryError)
}

#[inline(always)]
pub fn delete_permission(
    permission_id: PermissionId,
) -> Result<Permission, PermissionServiceError> {
    assert_permission_id(permission_id)?;

    get_repositories()
        .permission
        .remove_permission(&permission_id)
        .map_err(PermissionServiceError::RepositoryError)
}

#[inline(always)]
pub fn get_permissions(page_req: PageRequest<PermissionFilter, ()>) -> Page<Permission> {
    get_repositories()
        .permission
        .get_permissions_cloned(page_req)
}

fn assert_permission_id(id: PermissionId) -> Result<(), PermissionServiceError> {
    if id == DEFAULT_PERMISSION_ID {
        Err(PermissionServiceError::UnableToEditDefaultPermission)
    } else {
        Ok(())
    }
}
