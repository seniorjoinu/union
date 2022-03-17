export const idlFactory = ({ IDL }) => {
  const RoleId = IDL.Nat32;
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
    'fraction' : IDL.Float32,
    'enumerated' : IDL.Vec(RoleId),
  });
  const Profile = IDL.Record({
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
  const DetachRoleFromPermissionRequest = IDL.Record({
    'role_id' : RoleId,
    'permission_id' : PermissionId,
  });
  const RoleAndPermission = IDL.Record({
    'role_id' : RoleId,
    'permission_id' : PermissionId,
  });
  const RemoteCallPayload = IDL.Record({
    'args_candid' : IDL.Vec(IDL.Text),
    'endpoint' : RemoteCallEndpoint,
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
  const GetHistoryEntriesRequest = IDL.Record({
    'ids' : IDL.Vec(HistoryEntryId),
    'rnp' : RoleAndPermission,
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
  const AuthorizedRequest = IDL.Record({ 'rnp' : RoleAndPermission });
  const GetHistoryEntryIdsResponse = IDL.Record({
    'ids' : IDL.Vec(HistoryEntryId),
  });
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
  const GetPermissionsRequest = IDL.Record({
    'ids' : IDL.Vec(PermissionId),
    'rnp' : RoleAndPermission,
  });
  const GetPermissionsResponse = IDL.Record({
    'permissions' : IDL.Vec(Permission),
  });
  const GetPermissionsAttachedToRolesRequest = IDL.Record({
    'rnp' : RoleAndPermission,
    'role_ids' : IDL.Vec(RoleId),
  });
  const GetPermissionsAttachedToRolesResponse = IDL.Record({
    'result' : IDL.Vec(IDL.Tuple(RoleId, PermissionId)),
  });
  const GetPermissionsByPermissionTargetRequest = IDL.Record({
    'rnp' : RoleAndPermission,
    'target' : PermissionTarget,
  });
  const GetPermissionsByPermissionTargetResponse = IDL.Record({
    'ids' : IDL.Vec(PermissionId),
  });
  const GetRoleIdsResponse = IDL.Record({ 'ids' : IDL.Vec(RoleId) });
  const GetRolesRequest = IDL.Record({
    'ids' : IDL.Vec(RoleId),
    'rnp' : RoleAndPermission,
  });
  const GetRolesResponse = IDL.Record({ 'roles' : IDL.Vec(Role) });
  const GetRolesAttachedToPermissionsRequest = IDL.Record({
    'rnp' : RoleAndPermission,
    'permission_ids' : IDL.Vec(PermissionId),
  });
  const GetRolesAttachedToPermissionsResponse = IDL.Record({
    'result' : IDL.Vec(IDL.Tuple(PermissionId, RoleId)),
  });
  const GetScheduledForAuthorizationExecutionsResponse = IDL.Record({
    'entries' : IDL.Vec(HistoryEntry),
  });
  const RemovePermissionRequest = IDL.Record({
    'permission_id' : PermissionId,
  });
  const RemovePermissionResponse = IDL.Record({ 'permission' : Permission });
  const RemoveRoleRequest = IDL.Record({ 'role_id' : RoleId });
  const RemoveRoleResponse = IDL.Record({ 'role' : Role });
  const SubtractEnumeratedRolesRequest = IDL.Record({
    'enumerated_roles_to_subtract' : IDL.Vec(RoleId),
    'role_id' : RoleId,
  });
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
    'add_role_owners' : IDL.Func([AddEnumeratedRolesRequest], [], []),
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
    'create_permission' : IDL.Func(
        [CreatePermissionRequest],
        [CreatePermissionResponse],
        [],
      ),
    'create_role' : IDL.Func([CreateRoleRequest], [CreateRoleResponse], []),
    'detach_role_from_permission' : IDL.Func(
        [DetachRoleFromPermissionRequest],
        [],
        [],
      ),
    'execute' : IDL.Func([ExecuteRequest], [ExecuteResponse], []),
    'export_candid' : IDL.Func([], [IDL.Text], ['query']),
    'get_history_entries' : IDL.Func(
        [GetHistoryEntriesRequest],
        [GetHistoryEntriesResponse],
        ['query'],
      ),
    'get_history_entry_ids' : IDL.Func(
        [AuthorizedRequest],
        [GetHistoryEntryIdsResponse],
        ['query'],
      ),
    'get_my_permissions' : IDL.Func([], [GetMyPermissionsResponse], ['query']),
    'get_my_roles' : IDL.Func([], [GetMyRolesResponse], ['query']),
    'get_permission_ids' : IDL.Func(
        [AuthorizedRequest],
        [GetPermissionIdsResponse],
        ['query'],
      ),
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
    'get_role_ids' : IDL.Func(
        [AuthorizedRequest],
        [GetRoleIdsResponse],
        ['query'],
      ),
    'get_roles' : IDL.Func([GetRolesRequest], [GetRolesResponse], ['query']),
    'get_roles_attached_to_permissions' : IDL.Func(
        [GetRolesAttachedToPermissionsRequest],
        [GetRolesAttachedToPermissionsResponse],
        ['query'],
      ),
    'get_scheduled_for_authorization_executions' : IDL.Func(
        [AuthorizedRequest],
        [GetScheduledForAuthorizationExecutionsResponse],
        ['query'],
      ),
    'remove_permission' : IDL.Func(
        [RemovePermissionRequest],
        [RemovePermissionResponse],
        [],
      ),
    'remove_role' : IDL.Func([RemoveRoleRequest], [RemoveRoleResponse], []),
    'subtract_role_owners' : IDL.Func([SubtractEnumeratedRolesRequest], [], []),
    'update_permission' : IDL.Func([UpdatePermissionRequest], [], []),
    'update_role' : IDL.Func([UpdateRoleRequest], [], []),
  });
};
export const init = ({ IDL }) => { return [IDL.Principal]; };
