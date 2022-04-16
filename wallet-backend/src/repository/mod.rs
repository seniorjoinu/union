use crate::repository::profile::ProfileRepository;
use candid::{CandidType, Deserialize};
use crate::repository::group::GroupRepository;

pub mod group;
pub mod profile;

#[derive(CandidType, Deserialize)]
pub struct Repositories {
    pub profile: ProfileRepository,
    pub group: GroupRepository,
}

impl Repositories {
    pub fn new() -> Self {
        Self {
            profile: ProfileRepository::default(),
            group: GroupRepository::new(),
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
