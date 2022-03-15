use crate::api::{
    AddEnumeratedRolesRequest, AttachRoleToPermissionRequest, AuthorizeExecutionRequest,
    AuthorizeExecutionResponse, AuthorizedRequest, CreatePermissionRequest,
    CreatePermissionResponse, CreateRoleRequest, CreateRoleResponse,
    DetachRoleFromPermissionRequest, ExecuteRequest, ExecuteResponse, GetHistoryEntriesRequest,
    GetHistoryEntriesResponse, GetHistoryEntryIdsResponse, GetMyPermissionsResponse,
    GetMyRolesResponse, GetPermissionIdsResponse, GetPermissionsAttachedToRolesRequest,
    GetPermissionsAttachedToRolesResponse, GetPermissionsByPermissionTargetRequest,
    GetPermissionsByPermissionTargetResponse, GetPermissionsRequest, GetPermissionsResponse,
    GetRoleIdsResponse, GetRolesAttachedToPermissionsRequest,
    GetRolesAttachedToPermissionsResponse, GetRolesRequest, GetRolesResponse,
    GetScheduledForAuthorizationExecutionsResponse, RemovePermissionRequest,
    RemovePermissionResponse, RemoveRoleRequest, RemoveRoleResponse,
    SubtractEnumeratedRolesRequest, UpdatePermissionRequest, UpdateRoleRequest,
};
use crate::common::execution_history::{HistoryEntry, HistoryEntryId, Program, RemoteCallPayload};
use crate::common::permissions::PermissionId;
use crate::common::roles::{RoleId, RoleType, HAS_PROFILE_ROLE_ID};
use crate::common::utils::{validate_and_trim_str, CandidCallResult, ToCandidType};
use crate::guards::only_self_guard;
use crate::helpers::execute_program_and_log;
use crate::state::{Error, State, TaskType};
use ic_cdk::api::time;
use ic_cdk::caller;
use ic_cdk::export::Principal;
use ic_cdk_macros::{heartbeat, init, query, update};
use ic_cron::implement_cron;
use ic_cron::types::{Iterations, ScheduledTask, SchedulingOptions};

pub mod api;
pub mod common;
pub mod guards;
pub mod helpers;
pub mod state;

// -------------- EXECUTION & HISTORY ----------------

#[update]
fn execute(req: ExecuteRequest) -> ExecuteResponse {
    let caller = caller();
    let state = get_state();

    state
        .validate_authorized_request(
            &caller,
            &req.rnp.role_id,
            &req.rnp.permission_id,
            &req.program,
        )
        .expect("Access denied");

    // validate inputs
    let title = validate_and_trim_str(req.title, 3, 100, "Title").expect("Validation error");
    let description =
        validate_and_trim_str(req.description, 3, 100, "Description").expect("Validation error");

    // if the role is fulfilled - execute immediately, otherwise - put in the authorization queue
    let authorized_by = vec![caller];
    let is_role_fulfilled = state
        .roles
        .is_role_fulfilled(&req.rnp.role_id, &authorized_by);

    let timestamp_before = time();
    let entry = state.execution_history.create_pending_entry(
        title,
        description,
        req.program,
        timestamp_before,
        req.rnp.role_id,
        req.rnp.permission_id,
        authorized_by,
    );

    if is_role_fulfilled {
        let id = entry.id;
        execute_program_and_log(entry);

        ExecuteResponse::Executed(id)
    } else {
        let task_id = cron_enqueue(
            TaskType::CallAuthorization(entry),
            SchedulingOptions {
                delay_nano: req.authorization_delay_nano,
                interval_nano: 0,
                iterations: Iterations::Exact(1),
            },
        )
        .expect("Unable to schedule an execution");

        ExecuteResponse::ScheduledForAuthorization(task_id)
    }
}

#[update]
fn authorize_execution(req: AuthorizeExecutionRequest) -> AuthorizeExecutionResponse {
    let cron_state = get_cron_state();
    let task = cron_state
        .get_task_mut(&req.task_id)
        .expect("Task not found");

    let task_type: TaskType = task
        .get_payload()
        .expect("Unable to deserialize the payload");

    match task_type {
        TaskType::CallAuthorization(mut entry) => {
            let caller = caller();
            let state = get_state();

            // if the caller has the provided role
            state
                .roles
                .is_role_owner(&caller, &entry.role_id)
                .expect("Caller does not have the role");

            entry.authorized_by.push(caller);

            let is_role_fulfilled = state
                .roles
                .is_role_fulfilled(&entry.role_id, &entry.authorized_by);

            if is_role_fulfilled {
                cron_dequeue(req.task_id).expect("Unable to dequeue the task");

                let id = entry.id;
                execute_program_and_log(entry);

                AuthorizeExecutionResponse::Executed(id)
            } else {
                task.set_payload(TaskType::CallAuthorization(entry));

                AuthorizeExecutionResponse::ScheduledForAuthorization(req.task_id)
            }
        }
    }
}

#[query]
fn get_scheduled_for_authorization_executions(
    req: AuthorizedRequest,
) -> GetScheduledForAuthorizationExecutionsResponse {
    let state = get_state();

    state
        .validate_authorized_request(
            &caller(),
            &req.rnp.role_id,
            &req.rnp.permission_id,
            &Program::RemoteCallSequence(vec![RemoteCallPayload::this_empty(
                "get_scheduled_for_authorization_executions",
            )]),
        )
        .expect("Access denied");

    let entries = get_cron_state()
        .get_tasks_cloned()
        .into_iter()
        .map(|it| {
            let task_type = it
                .get_payload::<TaskType>()
                .expect("Unable to deserialize a task");

            match task_type {
                TaskType::CallAuthorization(e) => e,
            }
        })
        .collect();

    GetScheduledForAuthorizationExecutionsResponse { entries }
}

implement_cron!();

#[heartbeat]
fn tick() {
    for task in cron_ready_tasks() {
        match task
            .get_payload::<TaskType>()
            .expect("Unable to deserialize the payload")
        {
            TaskType::CallAuthorization(mut entry) => {
                let state = get_state();
                let is_role_fulfilled = state
                    .roles
                    .is_role_fulfilled(&entry.role_id, &entry.authorized_by);

                if is_role_fulfilled {
                    execute_program_and_log(entry);
                } else {
                    let state = get_state();
                    let timestamp_after = time();

                    entry.set_declined(timestamp_after, String::from("The role was not fulfilled"));
                    state.execution_history.add_executed_entry(entry);
                }
            }
        }
    }
}

#[query]
pub fn get_history_entry_ids(req: AuthorizedRequest) -> GetHistoryEntryIdsResponse {
    let state = get_state();

    state
        .validate_authorized_request(
            &caller(),
            &req.rnp.role_id,
            &req.rnp.permission_id,
            &Program::RemoteCallSequence(vec![RemoteCallPayload::this_empty(
                "get_history_entry_ids",
            )]),
        )
        .expect("Access denied");

    let ids = state.execution_history.get_entry_ids_cloned();

    GetHistoryEntryIdsResponse { ids }
}

#[query]
pub fn get_history_entries(req: GetHistoryEntriesRequest) -> GetHistoryEntriesResponse {
    let state = get_state();

    state
        .validate_authorized_request(
            &caller(),
            &req.rnp.role_id,
            &req.rnp.permission_id,
            &Program::RemoteCallSequence(vec![RemoteCallPayload::this_empty(
                "get_history_entries",
            )]),
        )
        .expect("Access denied");

    let mut entries = vec![];

    for id in &req.ids {
        let entry = state
            .execution_history
            .get_entry_by_id(id)
            .unwrap_or_else(|_| panic!("Unable to get entry with id {}", id));

        entries.push(entry.clone());
    }

    GetHistoryEntriesResponse { entries }
}

// ------------------ ROLES --------------------

#[update(guard = "only_self_guard")]
pub fn create_role(req: CreateRoleRequest) -> CreateRoleResponse {
    let state = get_state();

    let role_id = state
        .roles
        .create_role(req.role_type)
        .expect("Unable to create a role");

    CreateRoleResponse { role_id }
}

#[update(guard = "only_self_guard")]
pub fn update_role(req: UpdateRoleRequest) {
    let state = get_state();

    state
        .roles
        .update_role(&req.role_id, req.new_role_type)
        .expect("Unable to update a role");
}

#[update(guard = "only_self_guard")]
pub fn remove_role(req: RemoveRoleRequest) -> RemoveRoleResponse {
    let state = get_state();

    let role = state
        .remove_role(&req.role_id)
        .expect("Unable to remove a role");

    RemoveRoleResponse { role }
}

#[update(guard = "only_self_guard")]
pub fn add_enumerated_roles(req: AddEnumeratedRolesRequest) {
    let state = get_state();

    state
        .roles
        .add_enumerated_roles(&req.role_id, req.enumerated_roles_to_add)
        .expect("Unable to add enumerated roles");
}

#[update(guard = "only_self_guard")]
pub fn subtract_enumerated_roles(req: SubtractEnumeratedRolesRequest) {
    let state = get_state();

    state
        .roles
        .subtract_enumerated_roles(&req.role_id, req.enumerated_roles_to_subtract)
        .expect("Unable to subtract enumerated roles");
}

#[query]
pub fn get_role_ids(req: AuthorizedRequest) -> GetRoleIdsResponse {
    let state = get_state();

    state
        .validate_authorized_request(
            &caller(),
            &req.rnp.role_id,
            &req.rnp.permission_id,
            &Program::RemoteCallSequence(vec![RemoteCallPayload::this_empty("get_role_ids")]),
        )
        .expect("Access denied");

    let ids = state.roles.get_role_ids_cloned();

    GetRoleIdsResponse { ids }
}

#[query]
pub fn get_roles(req: GetRolesRequest) -> GetRolesResponse {
    let state = get_state();

    state
        .validate_authorized_request(
            &caller(),
            &req.rnp.role_id,
            &req.rnp.permission_id,
            &Program::RemoteCallSequence(vec![RemoteCallPayload::this_empty("get_roles")]),
        )
        .expect("Access denied");

    let mut roles = vec![];

    for id in &req.ids {
        let role = state
            .roles
            .get_role(id)
            .unwrap_or_else(|_| panic!("Unable to get role with id {}", id));
        roles.push(role.clone());
    }

    GetRolesResponse { roles }
}

#[query]
pub fn get_my_roles() -> GetMyRolesResponse {
    let id = caller();
    let state = get_state();

    let role_ids = state.roles.get_role_ids_by_role_owner_cloned(&id);
    let mut roles = vec![];

    for role_id in &role_ids {
        let role = state.roles.get_role(role_id).unwrap();
        roles.push(role.clone());
    }

    GetMyRolesResponse { roles }
}

// ---------------------- PERMISSIONS ----------------

#[update(guard = "only_self_guard")]
pub fn create_permission(req: CreatePermissionRequest) -> CreatePermissionResponse {
    let state = get_state();

    let permission_id = state
        .permissions
        .create_permission(req.name, req.targets, req.scope);

    CreatePermissionResponse { permission_id }
}

#[update(guard = "only_self_guard")]
pub fn update_permission(req: UpdatePermissionRequest) {
    let state = get_state();

    state
        .permissions
        .update_permission(
            &req.permission_id,
            req.new_name,
            req.new_targets,
            req.new_scope,
        )
        .expect("Unable to update a permission");
}

#[update(guard = "only_self_guard")]
pub fn remove_permission(req: RemovePermissionRequest) -> RemovePermissionResponse {
    let state = get_state();

    let permission = state
        .remove_permission(&req.permission_id)
        .expect("Unable to remove a permission");

    RemovePermissionResponse { permission }
}

#[query]
pub fn get_permission_ids(req: AuthorizedRequest) -> GetPermissionIdsResponse {
    let state = get_state();

    state
        .validate_authorized_request(
            &caller(),
            &req.rnp.role_id,
            &req.rnp.permission_id,
            &Program::RemoteCallSequence(vec![RemoteCallPayload::this_empty("get_permission_ids")]),
        )
        .expect("Access denied");

    let ids = state.permissions.get_permission_ids_cloned();

    GetPermissionIdsResponse { ids }
}

#[query]
pub fn get_permissions(req: GetPermissionsRequest) -> GetPermissionsResponse {
    let state = get_state();

    state
        .validate_authorized_request(
            &caller(),
            &req.rnp.role_id,
            &req.rnp.permission_id,
            &Program::RemoteCallSequence(vec![RemoteCallPayload::this_empty("get_permissions")]),
        )
        .expect("Access denied");

    let mut permissions = vec![];

    for id in &req.ids {
        let permission = state
            .permissions
            .get_permission(id)
            .unwrap_or_else(|_| panic!("Unable to get a permission with id {}", id));

        permissions.push(permission.clone());
    }

    GetPermissionsResponse { permissions }
}

#[query]
pub fn get_my_permissions() -> GetMyPermissionsResponse {
    let id = caller();
    let state = get_state();
    let role_ids = state.roles.get_role_ids_by_role_owner_cloned(&id);
    let mut permission_ids = vec![];

    for role_id in &role_ids {
        let mut some_permission_ids = state.get_permission_ids_of_role_cloned(role_id);
        permission_ids.append(&mut some_permission_ids);
    }

    let mut permissions = vec![];
    for permission_id in &permission_ids {
        let permission = state.permissions.get_permission(permission_id).unwrap();

        permissions.push(permission.clone());
    }

    GetMyPermissionsResponse { permissions }
}

#[query]
pub fn get_permissions_by_permission_target(
    req: GetPermissionsByPermissionTargetRequest,
) -> GetPermissionsByPermissionTargetResponse {
    let state = get_state();

    state
        .validate_authorized_request(
            &caller(),
            &req.rnp.role_id,
            &req.rnp.permission_id,
            &Program::RemoteCallSequence(vec![RemoteCallPayload::this_empty(
                "get_permissions_by_permission_target",
            )]),
        )
        .expect("Access denied");

    let ids = state
        .permissions
        .get_permission_ids_by_permission_target_cloned(&req.target);

    GetPermissionsByPermissionTargetResponse { ids }
}

// ----------------- ROLES & PERMISSIONS --------------------------

#[update(guard = "only_self_guard")]
pub fn attach_role_to_permission(req: AttachRoleToPermissionRequest) {
    let state = get_state();

    state
        .attach_role_to_permission(req.role_id, req.permission_id)
        .expect("Unable to attach a role to a permission");
}

#[update(guard = "only_self_guard")]
pub fn detach_role_from_permission(req: DetachRoleFromPermissionRequest) {
    let state = get_state();

    state
        .detach_role_from_permission(req.role_id, req.permission_id)
        .expect("Unable to detach a role from a permission");
}

#[query]
pub fn get_roles_attached_to_permissions(
    req: GetRolesAttachedToPermissionsRequest,
) -> GetRolesAttachedToPermissionsResponse {
    let state = get_state();

    state
        .validate_authorized_request(
            &caller(),
            &req.rnp.role_id,
            &req.rnp.permission_id,
            &Program::RemoteCallSequence(vec![RemoteCallPayload::this_empty(
                "get_roles_attached_to_permissions",
            )]),
        )
        .expect("Access denied");

    let mut result = vec![];

    for id in &req.permission_ids {
        let roles_of_permission = state.get_role_ids_of_permission_cloned(id);
        result.push((*id, roles_of_permission));
    }

    GetRolesAttachedToPermissionsResponse { result }
}

#[query]
pub fn get_permissions_attached_to_roles(
    req: GetPermissionsAttachedToRolesRequest,
) -> GetPermissionsAttachedToRolesResponse {
    let state = get_state();

    state
        .validate_authorized_request(
            &caller(),
            &req.rnp.role_id,
            &req.rnp.permission_id,
            &Program::RemoteCallSequence(vec![RemoteCallPayload::this_empty(
                "get_permissions_attached_to_roles",
            )]),
        )
        .expect("Access denied");

    let mut result = vec![];

    for id in &req.role_ids {
        let permissions_of_role = state.get_permission_ids_of_role_cloned(id);
        result.push((*id, permissions_of_role));
    }

    GetPermissionsAttachedToRolesResponse { result }
}

static mut STATE: Option<State> = None;

pub fn get_state() -> &'static mut State {
    unsafe { STATE.as_mut().unwrap() }
}

#[init]
fn init(wallet_owner: Principal) {
    let state = State::new(wallet_owner).expect("Unable to create state");

    unsafe {
        STATE = Some(state);
    }
}
