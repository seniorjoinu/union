import type { Principal } from '@dfinity/principal';
export interface AddEnumeratedRolesRequest {
  'enumerated_roles_to_add' : Array<RoleId>,
  'role_id' : RoleId,
}
export interface AttachRoleToPermissionRequest {
  'role_id' : RoleId,
  'permission_id' : PermissionId,
}
export interface AuthorizeExecutionRequest { 'task_id' : TaskId }
export type AuthorizeExecutionResponse = ExecuteResponse;
export type BatchId = bigint;
export type CallResult = { 'Ok' : string } |
  { 'Err' : [RejectionCode, string] };
export type ChunkId = bigint;
export interface CreateBatchResponse { 'batch_id' : BatchId }
export interface CreateChunkRequest {
  'content' : Array<number>,
  'batch_id' : BatchId,
}
export interface CreateChunkResponse { 'chunk_id' : ChunkId }
export interface CreatePermissionRequest {
  'name' : string,
  'scope' : PermissionScope,
  'targets' : Array<PermissionTarget>,
}
export interface CreatePermissionResponse { 'permission_id' : PermissionId }
export interface CreateRoleRequest { 'role_type' : RoleType }
export interface CreateRoleResponse { 'role_id' : RoleId }
export interface DeleteBatchesRequest { 'batch_ids' : Array<BatchId> }
export interface DetachRoleFromPermissionRequest {
  'role_id' : RoleId,
  'permission_id' : PermissionId,
}
export interface EditProfileRequest {
  'new_description' : [] | [string],
  'role_id' : RoleId,
  'new_name' : [] | [string],
}
export interface ExecuteRequest {
  'rnp' : RoleAndPermission,
  'title' : string,
  'authorization_delay_nano' : bigint,
  'description' : string,
  'program' : Program,
}
export type ExecuteResponse = { 'ScheduledForAuthorization' : TaskId } |
  { 'Executed' : HistoryEntryId };
export interface File { 'content' : Array<number>, 'mime_type' : string }
export interface FractionOf {
  'name' : string,
  'description' : string,
  'fraction' : number,
  'enumerated' : Array<RoleId>,
}
export interface GetHistoryEntriesRequest { 'ids' : Array<HistoryEntryId> }
export interface GetHistoryEntriesResponse { 'entries' : Array<HistoryEntry> }
export interface GetHistoryEntryIdsResponse { 'ids' : Array<HistoryEntryId> }
export interface GetInfoResponse { 'info' : UnionInfo }
export interface GetMyPermissionsResponse { 'permissions' : Array<Permission> }
export interface GetMyRolesResponse { 'roles' : Array<Role> }
export interface GetPermissionIdsResponse { 'ids' : Array<PermissionId> }
export interface GetPermissionsAttachedToRolesRequest {
  'role_ids' : Array<RoleId>,
}
export interface GetPermissionsAttachedToRolesResponse {
  'result' : Array<[RoleId, Array<PermissionId>]>,
}
export interface GetPermissionsByPermissionTargetRequest {
  'target' : PermissionTarget,
}
export interface GetPermissionsByPermissionTargetResponse {
  'ids' : Array<PermissionId>,
}
export interface GetPermissionsRequest { 'ids' : Array<PermissionId> }
export interface GetPermissionsResponse { 'permissions' : Array<Permission> }
export interface GetRoleIdsResponse { 'ids' : Array<RoleId> }
export interface GetRolesAttachedToPermissionsRequest {
  'permission_ids' : Array<PermissionId>,
}
export interface GetRolesAttachedToPermissionsResponse {
  'result' : Array<[PermissionId, Array<RoleId>]>,
}
export interface GetRolesRequest { 'ids' : Array<RoleId> }
export interface GetRolesResponse { 'roles' : Array<Role> }
export interface GetScheduledForAuthorizationExecutionsRequest {
  'task_ids' : [] | [Array<TaskId>],
}
export interface GetScheduledForAuthorizationExecutionsResponse {
  'entries' : Array<[TaskId, HistoryEntry]>,
}
export interface HistoryEntry {
  'id' : HistoryEntryId,
  'title' : string,
  'authorized_by' : Array<Principal>,
  'entry_type' : HistoryEntryType,
  'role_id' : RoleId,
  'description' : string,
  'timestamp' : bigint,
  'permission_id' : PermissionId,
  'program' : Program,
}
export type HistoryEntryId = bigint;
export type HistoryEntryType = { 'Executed' : [bigint, Array<CallResult>] } |
  { 'Declined' : [bigint, string] } |
  { 'Pending' : null };
export type Iterations = { 'Exact' : bigint } |
  { 'Infinite' : null };
export type Key = string;
export interface LockBatchesRequest { 'batch_ids' : Array<BatchId> }
export interface Permission {
  'id' : PermissionId,
  'name' : string,
  'scope' : PermissionScope,
  'targets' : Array<PermissionTarget>,
}
export type PermissionId = number;
export type PermissionScope = { 'Blacklist' : null } |
  { 'Whitelist' : null };
export type PermissionTarget = { 'Endpoint' : RemoteCallEndpoint } |
  { 'SelfEmptyProgram' : null } |
  { 'Canister' : Principal };
export interface Profile {
  'name' : string,
  'description' : string,
  'principal_id' : Principal,
}
export type Program = { 'Empty' : null } |
  { 'RemoteCallSequence' : Array<RemoteCallPayload> };
export interface QuantityOf {
  'name' : string,
  'description' : string,
  'enumerated' : Array<RoleId>,
  'quantity' : number,
}
export type RejectionCode = { 'NoError' : null } |
  { 'CanisterError' : null } |
  { 'SysTransient' : null } |
  { 'DestinationInvalid' : null } |
  { 'Unknown' : null } |
  { 'SysFatal' : null } |
  { 'CanisterReject' : null };
export type RemoteCallArgs = { 'CandidString' : Array<string> } |
  { 'Encoded' : Array<number> };
export interface RemoteCallEndpoint {
  'canister_id' : Principal,
  'method_name' : string,
}
export interface RemoteCallPayload {
  'endpoint' : RemoteCallEndpoint,
  'args' : RemoteCallArgs,
  'cycles' : bigint,
}
export interface RemovePermissionRequest { 'permission_id' : PermissionId }
export interface RemovePermissionResponse { 'permission' : Permission }
export interface RemoveRoleRequest { 'role_id' : RoleId }
export interface RemoveRoleResponse { 'role' : Role }
export interface Role { 'id' : RoleId, 'role_type' : RoleType }
export interface RoleAndPermission {
  'role_id' : RoleId,
  'permission_id' : PermissionId,
}
export type RoleId = number;
export type RoleType = { 'FractionOf' : FractionOf } |
  { 'Profile' : Profile } |
  { 'Everyone' : null } |
  { 'QuantityOf' : QuantityOf };
export interface ScheduledTask {
  'id' : TaskId,
  'scheduled_at' : bigint,
  'scheduling_options' : SchedulingOptions,
  'rescheduled_at' : [] | [bigint],
  'payload' : Task,
  'delay_passed' : boolean,
}
export interface SchedulingOptions {
  'interval_nano' : bigint,
  'iterations' : Iterations,
  'delay_nano' : bigint,
}
export interface SendBatchRequest {
  'key' : Key,
  'batch_id' : BatchId,
  'content_type' : string,
  'target_canister' : Principal,
}
export interface SubtractEnumeratedRolesRequest {
  'enumerated_roles_to_subtract' : Array<RoleId>,
  'role_id' : RoleId,
}
export interface Task { 'data' : Array<number> }
export type TaskId = bigint;
export interface UnionInfo {
  'logo' : [] | [File],
  'name' : string,
  'description' : string,
}
export interface UpdateInfoRequest { 'new_info' : UnionInfo }
export interface UpdatePermissionRequest {
  'new_targets' : [] | [Array<PermissionTarget>],
  'new_name' : [] | [string],
  'permission_id' : PermissionId,
  'new_scope' : [] | [PermissionScope],
}
export interface UpdateRoleRequest {
  'role_id' : RoleId,
  'new_role_type' : RoleType,
}
export interface _SERVICE {
  'add_enumerated_roles' : (arg_0: AddEnumeratedRolesRequest) => Promise<
      undefined
    >,
  'attach_role_to_permission' : (
      arg_0: AttachRoleToPermissionRequest,
    ) => Promise<undefined>,
  'authorize_execution' : (arg_0: AuthorizeExecutionRequest) => Promise<
      AuthorizeExecutionResponse
    >,
  'create_batch' : () => Promise<CreateBatchResponse>,
  'create_chunk' : (arg_0: CreateChunkRequest) => Promise<CreateChunkResponse>,
  'create_permission' : (arg_0: CreatePermissionRequest) => Promise<
      CreatePermissionResponse
    >,
  'create_role' : (arg_0: CreateRoleRequest) => Promise<CreateRoleResponse>,
  'delete_batches' : (arg_0: DeleteBatchesRequest) => Promise<undefined>,
  'delete_unlocked_batches' : (arg_0: DeleteBatchesRequest) => Promise<
      undefined
    >,
  'detach_role_from_permission' : (
      arg_0: DetachRoleFromPermissionRequest,
    ) => Promise<undefined>,
  'edit_profile' : (arg_0: EditProfileRequest) => Promise<undefined>,
  'execute' : (arg_0: ExecuteRequest) => Promise<ExecuteResponse>,
  'export_candid' : () => Promise<string>,
  'get_history_entries' : (arg_0: GetHistoryEntriesRequest) => Promise<
      GetHistoryEntriesResponse
    >,
  'get_history_entry_ids' : () => Promise<GetHistoryEntryIdsResponse>,
  'get_info' : () => Promise<GetInfoResponse>,
  'get_my_permissions' : () => Promise<GetMyPermissionsResponse>,
  'get_my_roles' : () => Promise<GetMyRolesResponse>,
  'get_permission_ids' : () => Promise<GetPermissionIdsResponse>,
  'get_permissions' : (arg_0: GetPermissionsRequest) => Promise<
      GetPermissionsResponse
    >,
  'get_permissions_attached_to_roles' : (
      arg_0: GetPermissionsAttachedToRolesRequest,
    ) => Promise<GetPermissionsAttachedToRolesResponse>,
  'get_permissions_by_permission_target' : (
      arg_0: GetPermissionsByPermissionTargetRequest,
    ) => Promise<GetPermissionsByPermissionTargetResponse>,
  'get_role_ids' : () => Promise<GetRoleIdsResponse>,
  'get_roles' : (arg_0: GetRolesRequest) => Promise<GetRolesResponse>,
  'get_roles_attached_to_permissions' : (
      arg_0: GetRolesAttachedToPermissionsRequest,
    ) => Promise<GetRolesAttachedToPermissionsResponse>,
  'get_scheduled_for_authorization_executions' : (
      arg_0: GetScheduledForAuthorizationExecutionsRequest,
    ) => Promise<GetScheduledForAuthorizationExecutionsResponse>,
  'lock_batches' : (arg_0: LockBatchesRequest) => Promise<undefined>,
  'remove_permission' : (arg_0: RemovePermissionRequest) => Promise<
      RemovePermissionResponse
    >,
  'remove_role' : (arg_0: RemoveRoleRequest) => Promise<RemoveRoleResponse>,
  'send_batch' : (arg_0: SendBatchRequest) => Promise<undefined>,
  'subtract_enumerated_roles' : (
      arg_0: SubtractEnumeratedRolesRequest,
    ) => Promise<undefined>,
  'update_info' : (arg_0: UpdateInfoRequest) => Promise<undefined>,
  'update_permission' : (arg_0: UpdatePermissionRequest) => Promise<undefined>,
  'update_role' : (arg_0: UpdateRoleRequest) => Promise<undefined>,
}
