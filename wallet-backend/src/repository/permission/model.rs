use crate::repository::permission::types::{
    PermissionId, PermissionTarget, PERMISSION_DESCRIPTION_MAX_LEN, PERMISSION_DESCRIPTION_MIN_LEN,
    PERMISSION_NAME_MAX_LEN, PERMISSION_NAME_MIN_LEN,
};
use candid::{CandidType, Deserialize};
use shared::mvc::Model;
use shared::remote_call::{Program, RemoteCallEndpoint};
use shared::validation::{validate_and_trim_str, ValidationError};
use std::collections::BTreeSet;

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Permission {
    id: Option<PermissionId>,
    name: String,
    description: String,
    targets: BTreeSet<PermissionTarget>,
}

impl Permission {
    pub fn new(
        name: String,
        description: String,
        targets: Vec<PermissionTarget>,
    ) -> Result<Self, ValidationError> {
        let permission = Permission {
            id: None,
            name: Self::process_name(name)?,
            description: Self::process_description(description)?,
            targets: targets.into_iter().collect(),
        };

        Ok(permission)
    }

    pub fn update(
        &mut self,
        new_name: Option<String>,
        new_description: Option<String>,
        new_targets: Option<BTreeSet<PermissionTarget>>,
    ) -> Result<(), ValidationError> {
        if let Some(name) = new_name {
            self.name = Self::process_name(name)?;
        }

        if let Some(description) = new_description {
            self.description = Self::process_description(description)?;
        }

        if let Some(targets) = new_targets {
            self.targets = targets;
        }

        Ok(())
    }

    pub fn is_program_allowed(&self, program: &Program) -> bool {
        match program {
            Program::RemoteCallSequence(sequence) => {
                for call in sequence {
                    if !self.is_target(Some(call.endpoint.clone())) {
                        return false;
                    }
                }
            }
            Program::Empty => {
                if !self.is_target(None) {
                    return false;
                }
            }
        };

        true
    }

    pub fn get_targets(&self) -> &BTreeSet<PermissionTarget> {
        &self.targets
    }

    fn is_target(&self, endpoint_opt: Option<RemoteCallEndpoint>) -> bool {
        match endpoint_opt {
            Some(endpoint) => {
                let target = PermissionTarget::Endpoint(endpoint.clone());
                let mut is_target = false;

                if self.targets.contains(&target) {
                    is_target = true;
                } else {
                    let wildcard_target = PermissionTarget::Endpoint(endpoint.to_wildcard());

                    if self.targets.contains(&wildcard_target) {
                        is_target = true;
                    }
                }

                is_target
            }
            None => self.targets.contains(&PermissionTarget::SelfEmptyProgram),
        }
    }

    fn process_name(name: String) -> Result<String, ValidationError> {
        validate_and_trim_str(
            name,
            PERMISSION_NAME_MIN_LEN,
            PERMISSION_NAME_MAX_LEN,
            "Permission name",
        )
    }

    fn process_description(description: String) -> Result<String, ValidationError> {
        validate_and_trim_str(
            description,
            PERMISSION_DESCRIPTION_MIN_LEN,
            PERMISSION_DESCRIPTION_MAX_LEN,
            "Permission description",
        )
    }
}

impl Model<PermissionId> for Permission {
    fn get_id(&self) -> Option<PermissionId> {
        self.id
    }

    fn _init_id(&mut self, id: PermissionId) {
        assert!(self.is_transient());
        self.id = Some(id);
    }

    fn is_transient(&self) -> bool {
        self.id.is_none()
    }
}
