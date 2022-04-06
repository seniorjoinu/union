use crate::common::permissions::{Permission, PermissionScope, PermissionTarget};
use crate::common::roles::{Role, RoleType};
use crate::common::streaming::{BatchId, ChunkId, Key};
use crate::state::UnionInfo;
use crate::{HistoryEntry, HistoryEntryId, PermissionId, Principal, Program, RoleId};
use ic_cdk::export::candid::{CandidType, Deserialize};
use ic_cron::types::TaskId;
use serde_bytes::ByteBuf;

#[derive(CandidType, Deserialize)]
pub struct RoleAndPermission {
    pub role_id: RoleId,
    pub permission_id: PermissionId,
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
}

#[derive(CandidType, Deserialize)]
pub struct GetHistoryEntriesResponse {
    pub entries: Vec<HistoryEntry>,
}

#[derive(CandidType, Deserialize)]
pub struct GetScheduledForAuthorizationExecutionsRequest {
    pub task_ids: Option<Vec<TaskId>>,
}

#[derive(CandidType, Deserialize)]
pub struct GetScheduledForAuthorizationExecutionsResponse {
    pub entries: Vec<(TaskId, HistoryEntry)>,
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
pub struct EditProfileRequest {
    pub role_id: RoleId,
    pub new_name: Option<String>,
    pub new_description: Option<String>,
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
}

#[derive(CandidType, Deserialize)]
pub struct GetRolesAttachedToPermissionsResponse {
    pub result: Vec<(PermissionId, Vec<RoleId>)>,
}

#[derive(CandidType, Deserialize)]
pub struct GetPermissionsAttachedToRolesRequest {
    pub role_ids: Vec<RoleId>,
}

#[derive(CandidType, Deserialize)]
pub struct GetPermissionsAttachedToRolesResponse {
    pub result: Vec<(RoleId, Vec<PermissionId>)>,
}

// -------------- ASSET CANISTER --------------

#[derive(CandidType, Deserialize)]
pub struct CreateAssetArguments {
    pub key: Key,
    pub content_type: String,
}

#[derive(CandidType, Deserialize)]
pub struct SetAssetContentArguments {
    pub key: Key,
    pub content_encoding: String,
    pub chunk_ids: Vec<ChunkId>,
    pub sha256: Option<ByteBuf>,
}

#[derive(CandidType, Deserialize)]
pub struct UnsetAssetContentArguments {
    pub key: Key,
    pub content_encoding: String,
}

#[derive(CandidType, Deserialize)]
pub struct DeleteAssetArguments {
    pub key: Key,
}

#[derive(CandidType, Deserialize)]
pub struct ClearArguments {}

#[derive(CandidType, Deserialize)]
pub enum BatchOperation {
    CreateAsset(CreateAssetArguments),
    SetAssetContent(SetAssetContentArguments),
    UnsetAssetContent(UnsetAssetContentArguments),
    DeleteAsset(DeleteAssetArguments),
    Clear(ClearArguments),
}

#[derive(CandidType, Deserialize)]
pub struct CommitBatchArguments {
    pub batch_id: BatchId,
    pub operations: Vec<BatchOperation>,
}

// -------------- STREAMING -------------------

#[derive(CandidType, Deserialize)]
pub struct SendBatchRequest {
    pub batch_id: BatchId,
    pub key: Key,
    pub content_type: String,
    pub target_canister: Principal,
}

#[derive(CandidType, Deserialize)]
pub struct CreateBatchResponse {
    pub batch_id: BatchId,
}

#[derive(CandidType, Deserialize)]
pub struct CreateChunkRequest {
    pub batch_id: BatchId,
    pub content: ByteBuf,
}

#[derive(CandidType, Deserialize)]
pub struct CreateChunkResponse {
    pub chunk_id: ChunkId,
}

#[derive(CandidType, Deserialize)]
pub struct LockBatchesRequest {
    pub batch_ids: Vec<BatchId>,
}

#[derive(CandidType, Deserialize)]
pub struct DeleteBatchesRequest {
    pub batch_ids: Vec<BatchId>,
}

// ------------------ INFO -------------------

#[derive(CandidType, Deserialize)]
pub struct UpdateInfoRequest {
    pub new_info: UnionInfo,
}

#[derive(CandidType, Deserialize)]
pub struct GetInfoResponse {
    pub info: UnionInfo,
}
