use crate::common::permissions::Permission;
use crate::common::profiles::Profile;
use crate::common::roles::Role;
use crate::{HistoryEntry, HistoryEntryId, PermissionId, Program, RoleId};
use ic_cdk::export::candid::{CandidType, Deserialize};
use ic_cdk::export::Principal;
use ic_cron::types::TaskId;

#[derive(CandidType, Deserialize)]
pub struct RoleAndPermission {
    pub role_id: RoleId,
    pub permission_id: PermissionId,
}

#[derive(CandidType, Deserialize)]
pub struct AuthorizedRequest {
    pub rnp: RoleAndPermission,
}

// ------------ EXECUTION & HISTORY -------------

#[derive(CandidType, Deserialize)]
pub struct ExecuteRequest {
    pub title: String,
    pub description: String,
    pub program: Program,
    pub authorization_delay_nano: u64,
    pub rnp: RoleAndPermission,
}

#[derive(CandidType, Deserialize)]
pub enum ExecuteResponse {
    Executed(HistoryEntryId),
    ScheduledForAuthorization(TaskId),
}

#[derive(CandidType, Deserialize)]
pub struct AuthorizeExecutionRequest {
    pub task_id: TaskId,
}

pub type AuthorizeExecutionResponse = ExecuteResponse;

#[derive(CandidType, Deserialize)]
pub struct GetHistoryEntryIdsResponse {
    pub ids: Vec<HistoryEntryId>,
}

#[derive(CandidType, Deserialize)]
pub struct GetHistoryEntriesRequest {
    pub ids: Vec<HistoryEntryId>,
    pub rnp: RoleAndPermission,
}

#[derive(CandidType, Deserialize)]
pub struct GetHistoryEntriesResponse {
    pub entries: Vec<HistoryEntry>,
}

// ----------------------- PROFILES --------------------

#[derive(CandidType, Deserialize)]
pub struct CreateProfileRequest {
    pub principal_id: Principal,
    pub name: String,
    pub description: String,
}

#[derive(CandidType, Deserialize)]
pub struct UpdateProfileRequest {
    pub principal_id: Principal,
    pub new_name: Option<String>,
    pub new_description: Option<String>,
}

#[derive(CandidType, Deserialize)]
pub struct RemoveProfileRequest {
    pub principal_id: Principal,
}

#[derive(CandidType, Deserialize)]
pub struct GetProfileIdsResponse {
    pub principal_ids: Vec<Principal>,
}

#[derive(CandidType, Deserialize)]
pub struct GetMyProfileResponse {
    pub profile: Profile,
}

#[derive(CandidType, Deserialize)]
pub struct GetProfilesRequest {
    pub principal_ids: Vec<Principal>,
    pub rnp: RoleAndPermission,
}

#[derive(CandidType, Deserialize)]
pub struct GetProfilesResponse {
    pub profiles: Vec<Profile>,
}

// ---------------------- ROLES -----------------------

#[derive(CandidType, Deserialize)]
pub struct GetMyRolesResponse {
    pub roles: Vec<Role>,
}

// ------------------------ PERMISSIONS ------------------

#[derive(CandidType, Deserialize)]
pub struct GetMyPermissionsResponse {
    pub permissions: Vec<Permission>,
}
