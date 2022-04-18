use crate::repository::group::GroupRepository;
use crate::repository::permission::PermissionRepository;
use crate::repository::profile::ProfileRepository;
use crate::repository::streaming::StreamingRepository;
use crate::repository::voting::VotingRepository;
use crate::repository::voting_config::VotingConfigRepository;
use candid::{CandidType, Deserialize};

pub mod group;
pub mod permission;
pub mod profile;
pub mod streaming;
pub mod voting;
pub mod voting_config;

#[derive(CandidType, Deserialize)]
pub struct Repositories {
    pub profile: ProfileRepository,
    pub group: GroupRepository,
    pub permission: PermissionRepository,
    pub streaming: StreamingRepository,
    pub voting_config: VotingConfigRepository,
    pub voting: VotingRepository,
}

impl Repositories {
    pub fn new() -> Self {
        Self {
            profile: ProfileRepository::default(),
            group: GroupRepository::new(),
            permission: PermissionRepository::default(),
            streaming: StreamingRepository::default(),
            voting_config: VotingConfigRepository::default(),
            voting: VotingRepository::default(),
        }
    }
}

static mut REPOSITORIES: Option<Repositories> = None;

pub fn get_repositories() -> &'static mut Repositories {
    unsafe {
        match REPOSITORIES.as_mut() {
            Some(r) => r,
            None => {
                REPOSITORIES = Some(Repositories::new());
                get_repositories()
            }
        }
    }
}
