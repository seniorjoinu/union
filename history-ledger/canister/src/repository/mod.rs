use crate::repository::program_execution::model::ProgramExecutionEntry;
use crate::repository::program_execution::types::ProgramExecutionEntryId;
use crate::repository::program_execution::ProgramExecutionRepository;
use crate::repository::shares_move::model::SharesMoveEntry;
use crate::repository::shares_move::types::{SharesMoveEntryFilter, SharesMoveEntryId};
use crate::repository::shares_move::SharesMoveRepository;
use candid::{CandidType, Deserialize};
use ic_cdk::storage::{stable_restore, stable_save};
use ic_cdk_macros::{post_upgrade, pre_upgrade};
use shared::mvc::HasRepository;

pub mod program_execution;
pub mod shares_move;

#[derive(Default, CandidType, Deserialize)]
pub struct Repositories {
    pub program_execution: ProgramExecutionRepository,
    pub shares_move: SharesMoveRepository,
}

static mut REPOSITORIES: Option<Repositories> = None;

fn get_repositories() -> &'static mut Repositories {
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

impl
    HasRepository<
        SharesMoveEntry,
        SharesMoveEntryId,
        SharesMoveEntryFilter,
        (),
        SharesMoveRepository,
    > for SharesMoveEntry
{
    fn repo() -> &'static mut SharesMoveRepository {
        &mut get_repositories().shares_move
    }
}

impl
    HasRepository<
        ProgramExecutionEntry,
        ProgramExecutionEntryId,
        (),
        (),
        ProgramExecutionRepository,
    > for ProgramExecutionEntry
{
    fn repo() -> &'static mut ProgramExecutionRepository {
        &mut get_repositories().program_execution
    }
}
