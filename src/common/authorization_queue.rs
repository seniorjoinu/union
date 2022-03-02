use crate::{PermissionId, Program, RoleId};
use ic_cdk::export::candid::{CandidType, Deserialize, Principal};
use ic_cron::types::{SchedulingInterval, TaskId};

pub struct AuthorizationQueueState {}

#[derive(CandidType, Deserialize)]
pub struct AuthorizationQueueEntry {
    pub task_id: TaskId,
    pub role_id: RoleId,
}

#[derive(CandidType, Deserialize)]
pub struct AuthorizationContext {
    pub program: Program,
    pub scheduling_interval_opt: Option<SchedulingInterval>,
    pub role_id: RoleId,
    pub permission_id: PermissionId,
    pub authorized_by: Vec<Principal>,
}
