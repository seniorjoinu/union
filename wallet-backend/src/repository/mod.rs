use crate::repository::group::GroupRepository;
use crate::repository::permission::PermissionRepository;
use crate::repository::profile::ProfileRepository;
use crate::repository::streaming::StreamingRepository;
use crate::repository::voting::VotingRepository;
use crate::repository::voting_config::VotingConfigRepository;
use candid::{CandidType, Deserialize};
use ic_cdk::storage::{stable_restore, stable_save};
use ic_cdk_macros::{post_upgrade, pre_upgrade};

pub mod group;
pub mod permission;
pub mod profile;
pub mod streaming;
pub mod voting;
pub mod voting_config;

#[derive(Default, CandidType, Deserialize)]
pub struct Repositories {
    pub profile: ProfileRepository,
    pub group: GroupRepository,
    pub permission: PermissionRepository,
    pub streaming: StreamingRepository,
    pub voting_config: VotingConfigRepository,
    pub voting: VotingRepository,
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

#[post_upgrade]
fn post_upgrade_hook() {
    let (repos, ) = stable_restore().expect("Unable to stable restore");

    set_repositories(repos);
}

#[pre_upgrade]
fn pre_upgrade_hook() {
    stable_save((take_repositories(), )).expect("Unable to stable save");
}
