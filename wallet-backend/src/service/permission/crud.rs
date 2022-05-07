use crate::repository::access_config::model::AccessConfig;
use crate::repository::permission::model::Permission;
use crate::repository::permission::types::{PermissionFilter, PermissionId, PermissionTarget};
use crate::repository::voting_config::model::VotingConfig;
use crate::service::permission::types::{PermissionError, PermissionService};
use shared::mvc::{HasRepository, Repository};
use shared::pageable::{Page, PageRequest};
use std::collections::BTreeSet;

impl PermissionService {
    #[inline(always)]
    pub fn create_permission(
        name: String,
        description: String,
        targets: Vec<PermissionTarget>,
    ) -> Result<PermissionId, PermissionError> {
        let permission = Permission::new(name, description, targets)
            .map_err(PermissionError::ValidationError)?;

        Ok(Permission::repo().save(permission))
    }

    pub fn update_permission(
        id: &PermissionId,
        new_name: Option<String>,
        new_description: Option<String>,
        new_targets: Option<BTreeSet<PermissionTarget>>,
    ) -> Result<(), PermissionError> {
        PermissionService::assert_not_default(*id)?;
        let mut permission = PermissionService::get_permission(id)?;

        // WARNING! it is possible to change the permission while related votings are in-progress

        permission
            .update(new_name, new_description, new_targets)
            .map_err(PermissionError::ValidationError)?;

        Permission::repo().save(permission);

        Ok(())
    }

    pub fn delete_permission(id: &PermissionId) -> Result<Permission, PermissionError> {
        PermissionService::assert_not_default(*id)?;

        if VotingConfig::repo().permission_has_related_voting_configs(id) {
            return Err(PermissionError::RelatedVotingConfigsExist);
        }
        if AccessConfig::repo().permission_has_related_access_configs(id) {
            return Err(PermissionError::RelatedAccessConfigsExist);
        }

        Permission::repo()
            .delete(id)
            .ok_or(PermissionError::PermissionNotFound(*id))
    }

    #[inline(always)]
    pub fn get_permission(id: &PermissionId) -> Result<Permission, PermissionError> {
        Permission::repo()
            .get(id)
            .ok_or(PermissionError::PermissionNotFound(*id))
    }

    #[inline(always)]
    pub fn list_permissions(page_req: &PageRequest<PermissionFilter, ()>) -> Page<Permission> {
        Permission::repo().list(page_req)
    }
}
