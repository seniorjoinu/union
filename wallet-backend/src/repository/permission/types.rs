use ic_cdk::export::candid::{CandidType, Deserialize, Principal};
use shared::mvc::Id;
use shared::remote_call::RemoteCallEndpoint;

pub const PERMISSION_NAME_MIN_LEN: usize = 1;
pub const PERMISSION_NAME_MAX_LEN: usize = 100;
pub const PERMISSION_DESCRIPTION_MIN_LEN: usize = 0;
pub const PERMISSION_DESCRIPTION_MAX_LEN: usize = 300;

pub type PermissionId = Id;

#[derive(CandidType, Deserialize, Clone, PartialEq, Ord, PartialOrd, Eq, Hash, Debug)]
pub enum PermissionTarget {
    SelfEmptyProgram,
    // TODO: switch to "*"
    Endpoint(RemoteCallEndpoint),
}

#[derive(CandidType, Deserialize)]
pub struct PermissionFilter {
    pub target: Option<PermissionTarget>,
}
