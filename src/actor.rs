use crate::common::authorization_queue::{AuthorizationContext, ExecutionObject};
use crate::common::execution_history::Program;
use crate::common::permissions::PermissionId;
use crate::common::roles::RoleId;
use crate::state::State;
use ic_cdk::caller;
use ic_cdk::export::candid::{CandidType, Deserialize};
use ic_cdk_macros::{heartbeat, query, update};
use ic_cron::implement_cron;
use ic_cron::types::{Iterations, SchedulingInterval, TaskId};

pub mod common;
pub mod state;

implement_cron!();

#[derive(CandidType, Deserialize)]
pub struct ExecuteRequest {
    pub program: Program,
    pub scheduling_interval_opt: Option<SchedulingInterval>,
    pub role_id: RoleId,
    pub permission_id: PermissionId,
    pub authorization_delay_nano: u64,
}

#[update]
fn execute(request: ExecuteRequest) -> TaskId {
    let caller = caller();
    let state = get_state();

    // if the caller has the provided role
    state
        .roles
        .is_role_owner(&caller, &request.role_id)
        .expect("Role check failed");

    // if the role has the permission
    state
        .is_role_attached_to_permission(&request.role_id, &request.permission_id)
        .expect("Role check failed");

    // if the program is a call sequence and each call in the sequence is compliant with the provided permission
    if let Program::RemoteCallSequence(sequence) = &request.program {
        for call in sequence {
            state
                .permissions
                .is_permission_target(call.endpoint.clone(), &request.permission_id)
                .expect("Permission check failed")
        }
    }

    let task = TaskType::CallAuthorization(AuthorizationContext {
        authorized_by: vec![caller],
        program: request.program,
        scheduling_interval_opt: request.scheduling_interval_opt,
        role_id: request.role_id,
        permission_id: request.permission_id,
    });

    cron_enqueue(
        task,
        SchedulingInterval {
            delay_nano: request.authorization_delay_nano,
            interval_nano: 0,
            iterations: Iterations::Exact(1),
        },
    )
    .expect("Unable to schedule an execution")
}

#[heartbeat]
fn tick() {}

static mut STATE: Option<State> = None;

pub fn get_state() -> &'static mut State {
    unsafe { STATE.as_mut().unwrap() }
}

#[derive(CandidType, Deserialize)]
pub enum TaskType {
    CallAuthorization(AuthorizationContext),
    CallExecution,
}
