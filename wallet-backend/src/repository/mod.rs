use crate::repository::group::GroupRepository;
use crate::repository::permission::PermissionRepository;
use crate::repository::profile::ProfileRepository;
use crate::repository::settings::SettingsRepository;
use crate::repository::streaming::StreamingRepository;
use crate::repository::voting::VotingRepository;
use crate::repository::voting_config::VotingConfigRepository;
use candid::{CandidType, Deserialize, Principal};
use ic_cdk::storage::{stable_restore, stable_save};
use ic_cdk_macros::{post_upgrade, pre_upgrade};

pub mod choice;
pub mod group;
pub mod permission;
pub mod profile;
pub mod settings;
pub mod streaming;
pub mod token;
pub mod voting;
pub mod voting_config;

#[derive(CandidType, Deserialize)]
pub struct Repositories {
    pub profile: ProfileRepository,
    pub group: GroupRepository,
    pub permission: PermissionRepository,
    pub settings: SettingsRepository,
    pub streaming: StreamingRepository,
    pub voting_config: VotingConfigRepository,
    pub voting: VotingRepository,
}

static mut REPOSITORIES: Option<Repositories> = None;

pub fn init_repositories(gateway: Principal, history_ledger: Principal, timestamp: u64) {
    unsafe {
        REPOSITORIES = Some(Repositories {
            profile: ProfileRepository::default(),
            group: GroupRepository::default(),
            permission: PermissionRepository::default(),
            settings: SettingsRepository::new(gateway, history_ledger, timestamp),
            streaming: StreamingRepository::default(),
            voting_config: VotingConfigRepository::default(),
            voting: VotingRepository::default(),
        })
    }
}

pub fn get_repositories() -> &'static mut Repositories {
    unsafe { REPOSITORIES.as_mut().unwrap() }
}

pub fn take_repositories() -> Option<Repositories> {
    unsafe { REPOSITORIES.take() }
}

pub fn set_repositories(repositories: Option<Repositories>) {
    unsafe { REPOSITORIES = repositories }
}
