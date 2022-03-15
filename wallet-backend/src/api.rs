use crate::common::permissions::{Permission, PermissionScope, PermissionTarget};
use crate::common::roles::{Role, RoleType};
use crate::{HistoryEntry, HistoryEntryId, PermissionId, Program, RoleId};
use ic_cdk::export::candid::{CandidType, Deserialize};
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

#[derive(CandidType, Deserialize)]
pub struct GetScheduledForAuthorizationExecutionsResponse {
    pub entries: Vec<HistoryEntry>,
}

// ---------------------- ROLES -----------------------

#[derive(CandidType, Deserialize)]
pub struct CreateRoleRequest {
    pub role_type: RoleType,
}

#[derive(CandidType, Deserialize)]
pub struct CreateRoleResponse {
    pub role_id: RoleId,
}

#[derive(CandidType, Deserialize)]
pub struct UpdateRoleRequest {
    pub role_id: RoleId,
    pub new_role_type: RoleType,
}

#[derive(CandidType, Deserialize)]
pub struct RemoveRoleRequest {
    pub role_id: RoleId,
}

#[derive(CandidType, Deserialize)]
pub struct RemoveRoleResponse {
    pub role: Role,
}

#[derive(CandidType, Deserialize)]
pub struct AddEnumeratedRolesRequest {
    pub role_id: RoleId,
    pub enumerated_roles_to_add: Vec<RoleId>,
}

#[derive(CandidType, Deserialize)]
pub struct SubtractEnumeratedRolesRequest {
    pub role_id: RoleId,
    pub enumerated_roles_to_subtract: Vec<RoleId>,
}

#[derive(CandidType, Deserialize)]
pub struct GetRoleIdsResponse {
    pub ids: Vec<RoleId>,
}

#[derive(CandidType, Deserialize)]
pub struct GetRolesRequest {
    pub ids: Vec<RoleId>,
    pub rnp: RoleAndPermission,
}

#[derive(CandidType, Deserialize)]
pub struct GetRolesResponse {
    pub roles: Vec<Role>,
}

#[derive(CandidType, Deserialize)]
pub struct GetMyRolesResponse {
    pub roles: Vec<Role>,
}

// ------------------------ PERMISSIONS ------------------

#[derive(CandidType, Deserialize)]
pub struct CreatePermissionRequest {
    pub name: String,
    pub targets: Vec<PermissionTarget>,
    pub scope: PermissionScope,
}

#[derive(CandidType, Deserialize)]
pub struct CreatePermissionResponse {
    pub permission_id: PermissionId,
}

#[derive(CandidType, Deserialize)]
pub struct UpdatePermissionRequest {
    pub permission_id: PermissionId,
    pub new_name: Option<String>,
    pub new_targets: Option<Vec<PermissionTarget>>,
    pub new_scope: Option<PermissionScope>,
}

#[derive(CandidType, Deserialize)]
pub struct RemovePermissionRequest {
    pub permission_id: PermissionId,
}

#[derive(CandidType, Deserialize)]
pub struct RemovePermissionResponse {
    pub permission: Permission,
}

#[derive(CandidType, Deserialize)]
pub struct GetPermissionIdsResponse {
    pub ids: Vec<PermissionId>,
}

#[derive(CandidType, Deserialize)]
pub struct GetPermissionsRequest {
    pub ids: Vec<PermissionId>,
    pub rnp: RoleAndPermission,
}

#[derive(CandidType, Deserialize)]
pub struct GetPermissionsResponse {
    pub permissions: Vec<Permission>,
}

#[derive(CandidType, Deserialize)]
pub struct GetMyPermissionsResponse {
    pub permissions: Vec<Permission>,
}

#[derive(CandidType, Deserialize)]
pub struct GetPermissionsByPermissionTargetRequest {
    pub target: PermissionTarget,
    pub rnp: RoleAndPermission,
}

#[derive(CandidType, Deserialize)]
pub struct GetPermissionsByPermissionTargetResponse {
    pub ids: Vec<PermissionId>,
}

// ---------------- ROLES & PERMISSIONS -----------------

#[derive(CandidType, Deserialize)]
pub struct AttachRoleToPermissionRequest {
    pub role_id: RoleId,
    pub permission_id: PermissionId,
}

#[derive(CandidType, Deserialize)]
pub struct DetachRoleFromPermissionRequest {
    pub role_id: RoleId,
    pub permission_id: PermissionId,
}

#[derive(CandidType, Deserialize)]
pub struct GetRolesAttachedToPermissionsRequest {
    pub permission_ids: Vec<PermissionId>,
    pub rnp: RoleAndPermission,
}

#[derive(CandidType, Deserialize)]
pub struct GetRolesAttachedToPermissionsResponse {
    pub result: Vec<(PermissionId, Vec<RoleId>)>,
}

#[derive(CandidType, Deserialize)]
pub struct GetPermissionsAttachedToRolesRequest {
    pub role_ids: Vec<RoleId>,
    pub rnp: RoleAndPermission,
}

#[derive(CandidType, Deserialize)]
pub struct GetPermissionsAttachedToRolesResponse {
    pub result: Vec<(RoleId, Vec<PermissionId>)>,
}
