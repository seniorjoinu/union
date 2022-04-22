use crate::repository::shares_move::SharesMoveRepository;
use crate::repository::voting_execution::VotingExecutionRepository;
use candid::{CandidType, Deserialize};
use ic_cdk::storage::{stable_restore, stable_save};
use ic_cdk_macros::{post_upgrade, pre_upgrade};

pub mod shares_move;
pub mod voting_execution;

#[derive(Default, CandidType, Deserialize)]
pub struct Repositories {
    pub voting_execution: VotingExecutionRepository,
    pub shares_move: SharesMoveRepository,
}

static mut REPOSITORIES: Option<Repositories> = None;

pub fn get_repositories() -> &'static mut Repositories {
    unsafe {
        match REPOSITORIES.as_mut() {
            Some(r) => r,
            None => {
                REPOSITORIES = Some(Repositories::default());
                get_repositories()
            }
        }
    }
}

pub fn take_repositories() -> Option<Repositories> {
    unsafe { REPOSITORIES.take() }
}

pub fn set_repositories(repositories: Option<Repositories>) {
    unsafe { REPOSITORIES = repositories }
}