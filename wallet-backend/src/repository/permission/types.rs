use ic_cdk::export::candid::{CandidType, Deserialize, Principal};
use shared::remote_call::RemoteCallEndpoint;
use std::collections::BTreeSet;

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
