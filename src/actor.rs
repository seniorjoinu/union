use crate::api::{
    AuthorizeExecutionRequest, AuthorizeExecutionResponse, CreateProfileRequest, ExecuteRequest,
    ExecuteResponse, GetHistoryEntriesRequest, GetHistoryEntriesResponse,
    GetHistoryEntryIdsResponse, GetMyPermissionsResponse, GetMyProfileResponse, GetMyRolesResponse,
    GetProfileIdsResponse, GetProfilesRequest, GetProfilesResponse, RemoveProfileRequest,
    UpdateMyProfileRequest, UpdateProfileRequest,
};
use crate::common::execution_history::{HistoryEntry, HistoryEntryId, Program};
use crate::common::permissions::PermissionId;
use crate::common::roles::{RoleId, HAS_PROFILE_ROLE_ID};
use crate::common::utils::{CandidCallResult, ToCandidType};
use crate::helpers::execute_program_and_log;
use crate::state::{State, TaskType};
use ic_cdk::api::time;
use ic_cdk::caller;
use ic_cdk::export::Principal;
use ic_cdk_macros::{heartbeat, init, query, update};
use ic_cron::implement_cron;
use ic_cron::types::{Iterations, ScheduledTask, SchedulingOptions};

pub mod api;
pub mod common;
pub mod helpers;
pub mod state;

// -------------- EXECUTION & HISTORY ----------------

#[update]
fn execute(req: ExecuteRequest) -> ExecuteResponse {
    let caller = caller();
    let state = get_state();

    let req = state
        .validate_execute_request(req, &caller)
        .expect("Request validation failed");

    // if the role is fulfilled - execute immediately, otherwise - put in the authorization queue
    let authorized_by = vec![caller];
    let is_role_fulfilled = state.roles.is_role_fulfilled(&req.role_id, &authorized_by);

    let timestamp_before = time();
    let entry = state.execution_history.create_pending_entry(
        req.title,
        req.description,
        req.program,
        timestamp_before,
        req.role_id,
        req.permission_id,
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

// TODO: make all methods checked for permission

#[query]
fn get_scheduled_for_authorization_executions() -> Vec<ScheduledTask> {
    get_cron_state().get_tasks_cloned()
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
pub fn get_history_entry_ids() -> GetHistoryEntryIdsResponse {
    let ids = get_state().execution_history.get_entry_ids_cloned();

    GetHistoryEntryIdsResponse { ids }
}

#[query]
pub fn get_history_entries(req: GetHistoryEntriesRequest) -> GetHistoryEntriesResponse {
    let mut entries = vec![];

    for id in &req.ids {
        let entry = get_state()
            .execution_history
            .get_entry_by_id(id)
            .expect(format!("Unable to get entry with id {}", id).as_str());

        entries.push(entry.clone());
    }

    GetHistoryEntriesResponse { entries }
}

// --------------------- PROFILES ----------------------
#[update]
pub fn create_profile(req: CreateProfileRequest) {
    get_state()
        .profiles
        .create_profile(req.principal_id, req.name, req.description)
        .expect("Unable to create a profile");

    get_state()
        .roles
        ._add_role_owners(HAS_PROFILE_ROLE_ID, vec![req.principal_id])
        .unwrap();
}

#[update]
pub fn update_profile(req: UpdateProfileRequest) {
    get_state()
        .profiles
        .update_profile(req.principal_id, req.new_name, req.new_description)
        .expect("Unable to update a profile");
}

#[update]
pub fn update_my_profile(req: UpdateMyProfileRequest) {
    let id = caller();

    get_state()
        .profiles
        .update_profile(id, req.new_name, req.new_description)
        .expect("Unable to update my profile");
}

#[update]
pub fn remove_profile(req: RemoveProfileRequest) {
    get_state()
        .profiles
        .remove_profile(&req.principal_id)
        .expect("Unable to remove a profile");

    get_state()
        .roles
        ._subtract_role_owners(HAS_PROFILE_ROLE_ID, vec![req.principal_id])
        .unwrap();
}

#[query]
pub fn get_profile_ids() -> GetProfileIdsResponse {
    let principal_ids = get_state().profiles.get_profile_ids_cloned();

    GetProfileIdsResponse { principal_ids }
}

#[query]
pub fn get_my_profile() -> GetMyProfileResponse {
    let id = caller();

    let profile = get_state()
        .profiles
        .get_profile(&id)
        .expect(format!("Unable to get profile with id {}", id).as_str())
        .clone();

    GetMyProfileResponse { profile }
}

#[query]
pub fn get_profiles(req: GetProfilesRequest) -> GetProfilesResponse {
    let mut profiles = vec![];

    for id in &req.principal_ids {
        let profile = get_state()
            .profiles
            .get_profile(id)
            .expect(format!("Unable to get profile with id {}", id).as_str());

        profiles.push(profile.clone());
    }

    GetProfilesResponse { profiles }
}

// ------------------ ROLES --------------------

#[query]
pub fn get_my_roles() -> GetMyRolesResponse {
    let id = caller();
    let role_ids = get_state().roles.get_role_ids_by_role_owner_cloned(&id);
    let mut roles = vec![];

    for role_id in &role_ids {
        let role = get_state().roles.get_role(role_id).unwrap();
        roles.push(role.clone());
    }

    GetMyRolesResponse { roles }
}

// ---------------------- PERMISSIONS ----------------

#[query]
pub fn get_my_permissions() -> GetMyPermissionsResponse {
    let id = caller();
    let role_ids = get_state().roles.get_role_ids_by_role_owner_cloned(&id);
    let mut permission_ids = vec![];

    for role_id in &role_ids {
        let mut some_permission_ids = get_state().get_permission_ids_of_role_cloned(role_id);
        permission_ids.append(&mut some_permission_ids);
    }

    let mut permissions = vec![];
    for permission_id in &permission_ids {
        let permission = get_state()
            .permissions
            .get_permission(permission_id)
            .unwrap();

        permissions.push(permission.clone());
    }

    GetMyPermissionsResponse { permissions }
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
