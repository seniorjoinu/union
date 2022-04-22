use ic_cdk::export::candid::{CandidType, Deserialize, Principal};
use shared::remote_call::{Program, RemoteCallEndpoint};
use std::collections::BTreeSet;
use shared::validation::{validate_and_trim_str, ValidationError};

const NAME_MIN_LEN: usize = 1;
const NAME_MAX_LEN: usize = 100;
const DESCRIPTION_MIN_LEN: usize = 0;
const DESCRIPTION_MAX_LEN: usize = 300;

pub type PermissionId = u16;

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum PermissionRepositoryError {
    PermissionDoesNotExist,
    NotPermissionTarget,
    ThereShouldBeAtLeastOnePermission,
    ValidationError(ValidationError),
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Permission {
    pub id: PermissionId,
    pub name: String,
    pub targets: BTreeSet<PermissionTarget>,
    pub scope: PermissionScope,
}

impl Permission {
    pub fn new(
        id: PermissionId,
        name: String,
        targets: Vec<PermissionTarget>,
        scope: PermissionScope,
    ) -> Result<Self, PermissionRepositoryError> {
        let permission = Permission {
            id,
            name: Self::process_name(name)?,
            targets: targets.into_iter().collect(),
            scope,
        };
        
        Ok(permission)
    }

    pub fn update(
        &mut self,
        new_name: Option<String>,
        new_targets: Option<Vec<PermissionTarget>>,
        new_scope: Option<PermissionScope>,
    ) -> Result<Option<BTreeSet<PermissionTarget>>, PermissionRepositoryError> {
        if let Some(name) = new_name {
            self.name = Self::process_name(name)?;
        }

        if let Some(scope) = new_scope {
            self.scope = scope;
        }

        if let Some(targets) = new_targets {
            let old_permission_targets =
                std::mem::replace(&mut self.targets, targets.into_iter().collect());
            
            Ok(Some(old_permission_targets))
        } else {
            Ok(None)
        }
    }
    
    pub fn is_program_allowed(
        &self,
        program: &Program,
    ) -> bool {
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

    pub fn is_target(
        &self,
        endpoint_opt: Option<RemoteCallEndpoint>,
    ) -> bool {
        let mut is_target = match endpoint_opt {
            Some(endpoint) => {
                let target = PermissionTarget::Endpoint(endpoint);
                let mut is_target = false;

                if self.targets.contains(&target) {
                    is_target = true;
                }

                let canister_target = target.to_canister().unwrap();

                if self.targets.contains(&canister_target) {
                    is_target = true;
                }

                is_target
            }
            None => self
                .targets
                .contains(&PermissionTarget::SelfEmptyProgram),
        };

        if matches!(self.scope, PermissionScope::Blacklist) {
            is_target = !is_target;
        }

        is_target
    }

    fn process_name(name: String) -> Result<String, PermissionRepositoryError> {
        validate_and_trim_str(name, NAME_MIN_LEN, NAME_MAX_LEN, "Name")
            .map_err(PermissionRepositoryError::ValidationError)
    }
}

#[derive(CandidType, Deserialize, Copy, Clone, Debug)]
pub enum PermissionScope {
    Whitelist,
    Blacklist,
}

#[derive(CandidType, Deserialize, Clone, PartialEq, Ord, PartialOrd, Eq, Hash, Debug)]
pub enum PermissionTarget {
    SelfEmptyProgram,
    Canister(Principal),
    Endpoint(RemoteCallEndpoint),
}

impl PermissionTarget {
    pub fn to_canister(self) -> Option<PermissionTarget> {
        match &self {
            PermissionTarget::SelfEmptyProgram => None,
            PermissionTarget::Canister(_) => Some(self),
            PermissionTarget::Endpoint(e) => Some(PermissionTarget::Canister(e.canister_id)),
        }
    }
}

#[derive(CandidType, Deserialize)]
pub struct PermissionFilter {
    pub target: Option<PermissionTarget>,
}