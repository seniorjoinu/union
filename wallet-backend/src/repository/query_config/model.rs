use crate::repository::permission::types::PermissionId;
use crate::repository::query_config::types::{QueryConfigId, QUERY_CONFIG_DESCRIPTION_MAX_LEN, QUERY_CONFIG_DESCRIPTION_MIN_LEN, QUERY_CONFIG_NAME_MAX_LEN, QUERY_CONFIG_NAME_MIN_LEN, AlloweeConstraint};
use candid::{CandidType, Deserialize};
use shared::mvc::Model;
use shared::validation::{validate_and_trim_str, ValidationError};
use std::collections::BTreeSet;

#[derive(Clone, CandidType, Deserialize)]
pub struct QueryConfig {
    id: Option<QueryConfigId>,
    name: String,
    description: String,

    permissions: BTreeSet<PermissionId>,
    allowees: BTreeSet<AlloweeConstraint>,
}

impl QueryConfig {
    pub fn new(
        name: String,
        description: String,
        permissions: BTreeSet<PermissionId>,
        allowees: BTreeSet<AlloweeConstraint>,
    ) -> Result<Self, ValidationError> {
        Ok(Self {
            id: None,
            name: Self::process_name(name)?,
            description: Self::process_description(description)?,
            permissions,
            allowees,
        })
    }

    pub fn update(
        &mut self,
        new_name: Option<String>,
        new_description: Option<String>,
        new_permissions: Option<BTreeSet<PermissionId>>,
        new_allowees: Option<BTreeSet<AlloweeConstraint>>,
    ) -> Result<(), ValidationError> {
        if let Some(name) = new_name {
            self.name = Self::process_name(name)?;
        }

        if let Some(description) = new_description {
            self.description = Self::process_description(description)?;
        }

        if let Some(permissions) = new_permissions {
            self.permissions = permissions;
        }

        if let Some(allowees) = new_allowees {
            self.allowees = allowees;
        }

        Ok(())
    }

    pub fn get_permissions(&self) -> &BTreeSet<PermissionId> {
        &self.permissions
    }

    pub fn get_allowees(&self) -> &BTreeSet<AlloweeConstraint> {
        &self.allowees
    }

    fn process_name(name: String) -> Result<String, ValidationError> {
        validate_and_trim_str(
            name,
            QUERY_CONFIG_NAME_MIN_LEN,
            QUERY_CONFIG_NAME_MAX_LEN,
            "Query config name",
        )
    }

    fn process_description(description: String) -> Result<String, ValidationError> {
        validate_and_trim_str(
            description,
            QUERY_CONFIG_DESCRIPTION_MIN_LEN,
            QUERY_CONFIG_DESCRIPTION_MAX_LEN,
            "Query config description",
        )
    }
}

impl Model<QueryConfigId> for QueryConfig {
    fn get_id(&self) -> Option<QueryConfigId> {
        self.id
    }

    fn _init_id(&mut self, id: QueryConfigId) {
        assert!(self.is_transient());
        self.id = Some(id);
    }

    fn is_transient(&self) -> bool {
        self.id.is_none()
    }
}
