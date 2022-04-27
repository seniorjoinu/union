use crate::repository::permission::types::PermissionId;
use crate::repository::query_config::model::QueryConfig;
use crate::repository::query_config::types::{AlloweeConstraint, QueryConfigId};
use crate::service::query_config::types::{QueryConfigError, QueryConfigService};
use shared::mvc::{HasRepository, Repository};
use std::collections::BTreeSet;

impl QueryConfigService {
    pub fn create_query_config(
        name: String,
        description: String,
        permissions: BTreeSet<PermissionId>,
        allowees: BTreeSet<AlloweeConstraint>,
    ) -> Result<QueryConfigId, QueryConfigError> {
        QueryConfigService::assert_permissions_exist(&permissions)?;
        QueryConfigService::assert_allowees_exist(&allowees)?;

        let qc = QueryConfig::new(name, description, permissions, allowees)
            .map_err(QueryConfigError::ValidationError)?;

        Ok(QueryConfig::repo().save(qc))
    }

    pub fn update_query_config(
        qc: &mut QueryConfig,
        new_name: Option<String>,
        new_description: Option<String>,
        new_permissions: Option<BTreeSet<PermissionId>>,
        new_allowees: Option<BTreeSet<AlloweeConstraint>>,
    ) -> Result<(), QueryConfigError> {
        if let Some(permissions) = &new_permissions {
            QueryConfigService::assert_permissions_exist(permissions)?;
        }

        if let Some(allowees) = &new_allowees {
            QueryConfigService::assert_allowees_exist(allowees)?;
        }

        qc.update(new_name, new_description, new_permissions, new_allowees)
            .map_err(QueryConfigError::ValidationError)
    }

    pub fn delete_query_config(qc_id: &QueryConfigId) -> Result<QueryConfig, QueryConfigError> {
        if QueryConfig::repo().count() == 1 {
            return Err(QueryConfigError::UnableToDeleteTheLastQueryConfig);
        }

        QueryConfig::repo()
            .delete(qc_id)
            .ok_or(QueryConfigError::QueryConfigNotFound(*qc_id))
    }
}
