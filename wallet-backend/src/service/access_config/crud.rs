use crate::repository::access_config::model::AccessConfig;
use crate::repository::access_config::types::{AccessConfigFilter, AlloweeConstraint};
use crate::repository::permission::types::PermissionId;
use crate::service::access_config::types::{AccessConfigError, AccessConfigService};
use shared::mvc::{HasRepository, Repository};
use shared::pageable::{Page, PageRequest};
use shared::types::wallet::AccessConfigId;
use std::collections::BTreeSet;

impl AccessConfigService {
    pub fn create_access_config(
        name: String,
        description: String,
        permissions: BTreeSet<PermissionId>,
        allowees: BTreeSet<AlloweeConstraint>,
    ) -> Result<AccessConfigId, AccessConfigError> {
        AccessConfigService::assert_permissions_exist(&permissions)?;
        AccessConfigService::assert_allowees_exist(&allowees)?;

        let qc = AccessConfig::new(name, description, permissions, allowees)
            .map_err(AccessConfigError::ValidationError)?;

        Ok(AccessConfig::repo().save(qc))
    }

    pub fn update_access_config(
        id: &AccessConfigId,
        new_name: Option<String>,
        new_description: Option<String>,
        new_permissions: Option<BTreeSet<PermissionId>>,
        new_allowees: Option<BTreeSet<AlloweeConstraint>>,
    ) -> Result<(), AccessConfigError> {
        if let Some(permissions) = &new_permissions {
            AccessConfigService::assert_permissions_exist(permissions)?;
        }

        if let Some(allowees) = &new_allowees {
            AccessConfigService::assert_allowees_exist(allowees)?;
        }

        let mut ac = AccessConfigService::get_access_config(id)?;

        ac.update(new_name, new_description, new_permissions, new_allowees)
            .map_err(AccessConfigError::ValidationError)?;
        AccessConfig::repo().save(ac);

        Ok(())
    }

    pub fn delete_access_config(id: &AccessConfigId) -> Result<AccessConfig, AccessConfigError> {
        if AccessConfig::repo().count() == 1 {
            return Err(AccessConfigError::UnableToDeleteTheLastAccessConfig);
        }

        AccessConfig::repo()
            .delete(id)
            .ok_or(AccessConfigError::AccessConfigNotFound(*id))
    }

    #[inline(always)]
    pub fn get_access_config(id: &AccessConfigId) -> Result<AccessConfig, AccessConfigError> {
        AccessConfig::repo()
            .get(id)
            .ok_or(AccessConfigError::AccessConfigNotFound(*id))
    }

    #[inline(always)]
    pub fn list_access_configs(
        page_req: &PageRequest<AccessConfigFilter, ()>,
    ) -> Page<AccessConfig> {
        AccessConfig::repo().list(page_req)
    }
}
