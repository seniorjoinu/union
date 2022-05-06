export const idlFactory = ({ IDL }) => {
  const RoleId = IDL.Nat32;
  const ActivateProfileRequest = IDL.Record({ 'role_id' : RoleId });
  const AddEnumeratedRolesRequest = IDL.Record({
    'enumerated_roles_to_add' : IDL.Vec(RoleId),
    'role_id' : RoleId,
  });
  const PermissionId = IDL.Nat16;
  const AttachRoleToPermissionRequest = IDL.Record({
    'role_id' : RoleId,
    'permission_id' : PermissionId,
  });
  const TaskId = IDL.Nat64;
  const AuthorizeExecutionRequest = IDL.Record({ 'task_id' : TaskId });
  const HistoryEntryId = IDL.Nat64;
  const ExecuteResponse = IDL.Variant({
    'ScheduledForAuthorization' : TaskId,
    'Executed' : HistoryEntryId,
  });
  const AuthorizeExecutionResponse = ExecuteResponse;
  const Key = IDL.Text;
  const CreateBatchRequest = IDL.Record({
    'key' : Key,
    'content_type' : IDL.Text,
  });
  const BatchId = IDL.Nat;
  const CreateBatchResponse = IDL.Record({ 'batch_id' : BatchId });
  const CreateChunkRequest = IDL.Record({
    'content' : IDL.Vec(IDL.Nat8),
    'batch_id' : BatchId,
  });
  const ChunkId = IDL.Nat;
  const CreateChunkResponse = IDL.Record({ 'chunk_id' : ChunkId });
  const PermissionScope = IDL.Variant({
    'Blacklist' : IDL.Null,
    'Whitelist' : IDL.Null,
  });
  const RemoteCallEndpoint = IDL.Record({
    'canister_id' : IDL.Principal,
    'method_name' : IDL.Text,
  });
  const PermissionTarget = IDL.Variant({
    'Endpoint' : RemoteCallEndpoint,
    'SelfEmptyProgram' : IDL.Null,
    'Canister' : IDL.Principal,
  });
  const CreatePermissionRequest = IDL.Record({
    'name' : IDL.Text,
    'scope' : PermissionScope,
    'targets' : IDL.Vec(PermissionTarget),
  });
  const CreatePermissionResponse = IDL.Record({
    'permission_id' : PermissionId,
  });
  const FractionOf = IDL.Record({
    'name' : IDL.Text,
    'description' : IDL.Text,
    'fraction' : IDL.Float64,
    'enumerated' : IDL.Vec(RoleId),
  });
  const Profile = IDL.Record({
    'active' : IDL.Bool,
    'name' : IDL.Text,
    'description' : IDL.Text,
    'principal_id' : IDL.Principal,
  });
  const QuantityOf = IDL.Record({
    'name' : IDL.Text,
    'description' : IDL.Text,
    'enumerated' : IDL.Vec(RoleId),
    'quantity' : IDL.Nat32,
  });
  const RoleType = IDL.Variant({
    'FractionOf' : FractionOf,
    'Profile' : Profile,
    'Everyone' : IDL.Null,
    'QuantityOf' : QuantityOf,
  });
  const CreateRoleRequest = IDL.Record({ 'role_type' : RoleType });
  const CreateRoleResponse = IDL.Record({ 'role_id' : RoleId });
  const DeleteBatchesRequest = IDL.Record({ 'batch_ids' : IDL.Vec(BatchId) });
  const DetachRoleFromPermissionRequest = IDL.Record({
    'role_id' : RoleId,
    'permission_id' : PermissionId,
  });
  const EditProfileRequest = IDL.Record({
    'new_description' : IDL.Opt(IDL.Text),
    'role_id' : RoleId,
    'new_name' : IDL.Opt(IDL.Text),
  });
  const RoleAndPermission = IDL.Record({
    'role_id' : RoleId,
    'permission_id' : PermissionId,
  });
  const RemoteCallArgs = IDL.Variant({
    'CandidString' : IDL.Vec(IDL.Text),
    'Encoded' : IDL.Vec(IDL.Nat8),
  });
  const RemoteCallPayload = IDL.Record({
    'endpoint' : RemoteCallEndpoint,
    'args' : RemoteCallArgs,
    'cycles' : IDL.Nat64,
  });
  const Program = IDL.Variant({
    'Empty' : IDL.Null,
    'RemoteCallSequence' : IDL.Vec(RemoteCallPayload),
  });
  const ExecuteRequest = IDL.Record({
    'rnp' : RoleAndPermission,
    'title' : IDL.Text,
    'authorization_delay_nano' : IDL.Nat64,
    'description' : IDL.Text,
    'program' : Program,
  });
  const Batch = IDL.Record({
    'key' : Key,
    'content_type' : IDL.Text,
    'locked' : IDL.Bool,
    'chunk_ids' : IDL.Vec(ChunkId),
  });
  const GetBatchesResponse = IDL.Record({
    'batches' : IDL.Vec(IDL.Tuple(BatchId, Batch)),
  });
  const GetChunkRequest = IDL.Record({ 'chunk_id' : ChunkId });
  const GetChunkResponse = IDL.Record({ 'chunk_content' : IDL.Vec(IDL.Nat8) });
  const GetHistoryEntriesRequest = IDL.Record({
    'ids' : IDL.Vec(HistoryEntryId),
  });
  const RejectionCode = IDL.Variant({
    'NoError' : IDL.Null,
    'CanisterError' : IDL.Null,
    'SysTransient' : IDL.Null,
    'DestinationInvalid' : IDL.Null,
    'Unknown' : IDL.Null,
    'SysFatal' : IDL.Null,
    'CanisterReject' : IDL.Null,
  });
  const CallResult = IDL.Variant({
    'Ok' : IDL.Text,
    'Err' : IDL.Tuple(RejectionCode, IDL.Text),
  });
  const HistoryEntryType = IDL.Variant({
    'Executed' : IDL.Tuple(IDL.Nat64, IDL.Vec(CallResult)),
    'Declined' : IDL.Tuple(IDL.Nat64, IDL.Text),
    'Pending' : IDL.Null,
  });
  const HistoryEntry = IDL.Record({
    'id' : HistoryEntryId,
    'title' : IDL.Text,
    'authorized_by' : IDL.Vec(IDL.Principal),
    'entry_type' : HistoryEntryType,
    'role_id' : RoleId,
    'description' : IDL.Text,
    'timestamp' : IDL.Nat64,
    'permission_id' : PermissionId,
    'program' : Program,
  });
  const GetHistoryEntriesResponse = IDL.Record({
    'entries' : IDL.Vec(HistoryEntry),
  });
  const GetHistoryEntryIdsResponse = IDL.Record({
    'ids' : IDL.Vec(HistoryEntryId),
  });
  const File = IDL.Record({
    'content' : IDL.Vec(IDL.Nat8),
    'mime_type' : IDL.Text,
  });
  const UnionInfo = IDL.Record({
    'logo' : IDL.Opt(File),
    'name' : IDL.Text,
    'description' : IDL.Text,
  });
  const GetInfoResponse = IDL.Record({ 'info' : UnionInfo });
  const Permission = IDL.Record({
    'id' : PermissionId,
    'name' : IDL.Text,
    'scope' : PermissionScope,
    'targets' : IDL.Vec(PermissionTarget),
  });
  const GetMyPermissionsResponse = IDL.Record({
    'permissions' : IDL.Vec(Permission),
  });
  const Role = IDL.Record({ 'id' : RoleId, 'role_type' : RoleType });
  const GetMyRolesResponse = IDL.Record({ 'roles' : IDL.Vec(Role) });
  const GetPermissionIdsResponse = IDL.Record({
    'ids' : IDL.Vec(PermissionId),
  });
  const GetPermissionsRequest = IDL.Record({ 'ids' : IDL.Vec(PermissionId) });
  const GetPermissionsResponse = IDL.Record({
    'permissions' : IDL.Vec(Permission),
  });
  const GetPermissionsAttachedToRolesRequest = IDL.Record({
    'role_ids' : IDL.Vec(RoleId),
  });
  const GetPermissionsAttachedToRolesResponse = IDL.Record({
    'result' : IDL.Vec(IDL.Tuple(RoleId, IDL.Vec(PermissionId))),
  });
  const GetPermissionsByPermissionTargetRequest = IDL.Record({
    'target' : PermissionTarget,
  });
  const GetPermissionsByPermissionTargetResponse = IDL.Record({
    'ids' : IDL.Vec(PermissionId),
  });
  const GetRoleIdsResponse = IDL.Record({ 'ids' : IDL.Vec(RoleId) });
  const GetRolesRequest = IDL.Record({ 'ids' : IDL.Vec(RoleId) });
  const GetRolesResponse = IDL.Record({ 'roles' : IDL.Vec(Role) });
  const GetRolesAttachedToPermissionsRequest = IDL.Record({
    'permission_ids' : IDL.Vec(PermissionId),
  });
  const GetRolesAttachedToPermissionsResponse = IDL.Record({
    'result' : IDL.Vec(IDL.Tuple(PermissionId, IDL.Vec(RoleId))),
  });
  const GetScheduledForAuthorizationExecutionsRequest = IDL.Record({
    'task_ids' : IDL.Opt(IDL.Vec(TaskId)),
  });
  const GetScheduledForAuthorizationExecutionsResponse = IDL.Record({
    'entries' : IDL.Vec(IDL.Tuple(TaskId, HistoryEntry)),
  });
  const LockBatchesRequest = IDL.Record({ 'batch_ids' : IDL.Vec(BatchId) });
  const RemovePermissionRequest = IDL.Record({
    'permission_id' : PermissionId,
  });
  const RemovePermissionResponse = IDL.Record({ 'permission' : Permission });
  const RemoveRoleRequest = IDL.Record({ 'role_id' : RoleId });
  const RemoveRoleResponse = IDL.Record({ 'role' : Role });
  const SendBatchRequest = IDL.Record({
    'batch_id' : BatchId,
    'target_canister' : IDL.Principal,
  });
  const SubtractEnumeratedRolesRequest = IDL.Record({
    'enumerated_roles_to_subtract' : IDL.Vec(RoleId),
    'role_id' : RoleId,
  });
  const UpdateInfoRequest = IDL.Record({ 'new_info' : UnionInfo });
  const UpdatePermissionRequest = IDL.Record({
    'new_targets' : IDL.Opt(IDL.Vec(PermissionTarget)),
    'new_name' : IDL.Opt(IDL.Text),
    'permission_id' : PermissionId,
    'new_scope' : IDL.Opt(PermissionScope),
  });
  const UpdateRoleRequest = IDL.Record({
    'role_id' : RoleId,
    'new_role_type' : RoleType,
  });
  return IDL.Service({
    'activate_profile' : IDL.Func([ActivateProfileRequest], [], []),
    'add_enumerated_roles' : IDL.Func([AddEnumeratedRolesRequest], [], []),
    'attach_role_to_permission' : IDL.Func(
        [AttachRoleToPermissionRequest],
        [],
        [],
      ),
    'authorize_execution' : IDL.Func(
        [AuthorizeExecutionRequest],
        [AuthorizeExecutionResponse],
        [],
      ),
    'create_batch' : IDL.Func([CreateBatchRequest], [CreateBatchResponse], []),
    'create_chunk' : IDL.Func([CreateChunkRequest], [CreateChunkResponse], []),
    'create_permission' : IDL.Func(
        [CreatePermissionRequest],
        [CreatePermissionResponse],
        [],
      ),
    'create_role' : IDL.Func([CreateRoleRequest], [CreateRoleResponse], []),
    'delete_batches' : IDL.Func([DeleteBatchesRequest], [], []),
    'delete_unlocked_batches' : IDL.Func([DeleteBatchesRequest], [], []),
    'detach_role_from_permission' : IDL.Func(
        [DetachRoleFromPermissionRequest],
        [],
        [],
      ),
    'edit_profile' : IDL.Func([EditProfileRequest], [], []),
    'execute' : IDL.Func([ExecuteRequest], [ExecuteResponse], []),
    'export_candid' : IDL.Func([], [IDL.Text], ['query']),
    'get_batches' : IDL.Func([], [GetBatchesResponse], ['query']),
    'get_chunk' : IDL.Func([GetChunkRequest], [GetChunkResponse], ['query']),
    'get_history_entries' : IDL.Func(
        [GetHistoryEntriesRequest],
        [GetHistoryEntriesResponse],
        ['query'],
      ),
    'get_history_entry_ids' : IDL.Func(
        [],
        [GetHistoryEntryIdsResponse],
        ['query'],
      ),
    'get_info' : IDL.Func([], [GetInfoResponse], ['query']),
    'get_my_permissions' : IDL.Func([], [GetMyPermissionsResponse], ['query']),
    'get_my_roles' : IDL.Func([], [GetMyRolesResponse], ['query']),
    'get_permission_ids' : IDL.Func([], [GetPermissionIdsResponse], ['query']),
    'get_permissions' : IDL.Func(
        [GetPermissionsRequest],
        [GetPermissionsResponse],
        ['query'],
      ),
    'get_permissions_attached_to_roles' : IDL.Func(
        [GetPermissionsAttachedToRolesRequest],
        [GetPermissionsAttachedToRolesResponse],
        ['query'],
      ),
    'get_permissions_by_permission_target' : IDL.Func(
        [GetPermissionsByPermissionTargetRequest],
        [GetPermissionsByPermissionTargetResponse],
        ['query'],
      ),
    'get_role_ids' : IDL.Func([], [GetRoleIdsResponse], ['query']),
    'get_roles' : IDL.Func([GetRolesRequest], [GetRolesResponse], ['query']),
    'get_roles_attached_to_permissions' : IDL.Func(
        [GetRolesAttachedToPermissionsRequest],
        [GetRolesAttachedToPermissionsResponse],
        ['query'],
      ),
    'get_scheduled_for_authorization_executions' : IDL.Func(
        [GetScheduledForAuthorizationExecutionsRequest],
        [GetScheduledForAuthorizationExecutionsResponse],
        ['query'],
      ),
    'lock_batches' : IDL.Func([LockBatchesRequest], [], []),
    'remove_permission' : IDL.Func(
        [RemovePermissionRequest],
        [RemovePermissionResponse],
        [],
      ),
    'remove_role' : IDL.Func([RemoveRoleRequest], [RemoveRoleResponse], []),
    'send_batch' : IDL.Func([SendBatchRequest], [], []),
    'subtract_enumerated_roles' : IDL.Func(
        [SubtractEnumeratedRolesRequest],
        [],
        [],
      ),
    'update_info' : IDL.Func([UpdateInfoRequest], [], []),
    'update_permission' : IDL.Func([UpdatePermissionRequest], [], []),
    'update_role' : IDL.Func([UpdateRoleRequest], [], []),
  });
};
export const init = ({ IDL }) => { return [IDL.Principal]; };
