use ic_cdk::export::candid::{CandidType, Deserialize, Principal};
use shared::remote_call::RemoteCallEndpoint;
use std::collections::BTreeSet;
use crate::repository::voting::types::Program;

pub type PermissionId = u16;

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum PermissionRepositoryError {
    PermissionDoesNotExist,
    NotPermissionTarget,
    ThereShouldBeAtLeastOnePermission,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Permission {
    pub id: PermissionId,
    pub name: String,
    pub targets: BTreeSet<PermissionTarget>,
    pub scope: PermissionScope,
}

impl Permission {
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
