use crate::repository::batch::model::Batch;
use crate::repository::batch::types::BatchId;
use crate::repository::batch::BatchRepository;
use crate::repository::choice::model::Choice;
use crate::repository::choice::types::ChoiceFilter;
use crate::repository::choice::ChoiceRepository;
use crate::repository::chunk::model::Chunk;
use crate::repository::chunk::types::{ChunkFilter, ChunkId};
use crate::repository::chunk::ChunkRepository;
use crate::repository::group::model::Group;
use crate::repository::group::GroupRepository;
use crate::repository::permission::model::Permission;
use crate::repository::permission::types::{PermissionFilter, PermissionId};
use crate::repository::permission::PermissionRepository;
use crate::repository::profile::model::Profile;
use crate::repository::profile::ProfileRepository;
use crate::repository::query_config::model::QueryConfig;
use crate::repository::query_config::types::{QueryConfigFilter, QueryConfigId};
use crate::repository::query_config::QueryConfigRepository;
use crate::repository::token::model::Token;
use crate::repository::token::types::{TokenFilter, TokenId};
use crate::repository::token::TokenRepository;
use crate::repository::voting::model::Voting;
use crate::repository::voting::VotingRepository;
use crate::repository::voting_config::model::VotingConfig;
use crate::repository::voting_config::types::VotingConfigFilter;
use crate::repository::voting_config::VotingConfigRepository;
use candid::{CandidType, Deserialize};
use shared::mvc::HasRepository;
use shared::types::wallet::{ChoiceId, GroupId, ProfileId, VotingConfigId, VotingId};

pub mod batch;
pub mod choice;
pub mod chunk;
pub mod group;
pub mod permission;
pub mod profile;
pub mod query_config;
pub mod token;
pub mod voting;
pub mod voting_config;

#[derive(Default, CandidType, Deserialize)]
pub struct Repositories {
    batch: BatchRepository,
    choice: ChoiceRepository,
    chunk: ChunkRepository,
    group: GroupRepository,
    profile: ProfileRepository,
    permission: PermissionRepository,
    query_config: QueryConfigRepository,
    token: TokenRepository,
    voting_config: VotingConfigRepository,
    voting: VotingRepository,
}

static mut REPOSITORIES: Option<Repositories> = None;

fn get_repositories() -> &'static mut Repositories {
    unsafe {
        match REPOSITORIES.as_mut() {
            Some(r) => r,
            None => {
                set_repositories(Some(Repositories::default()));
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

impl HasRepository<Batch, BatchId, (), (), BatchRepository> for Batch {
    fn repo() -> &'static mut BatchRepository {
        &mut get_repositories().batch
    }
}

impl HasRepository<Choice, ChoiceId, ChoiceFilter, (), ChoiceRepository> for Choice {
    fn repo() -> &'static mut ChoiceRepository {
        &mut get_repositories().choice
    }
}

impl HasRepository<Chunk, ChunkId, ChunkFilter, (), ChunkRepository> for Chunk {
    fn repo() -> &'static mut ChunkRepository {
        &mut get_repositories().chunk
    }
}

impl HasRepository<Group, GroupId, (), (), GroupRepository> for Group {
    fn repo() -> &'static mut GroupRepository {
        &mut get_repositories().group
    }
}

impl HasRepository<Profile, ProfileId, (), (), ProfileRepository> for Profile {
    fn repo() -> &'static mut ProfileRepository {
        &mut get_repositories().profile
    }
}

impl HasRepository<Permission, PermissionId, PermissionFilter, (), PermissionRepository>
    for Permission
{
    fn repo() -> &'static mut PermissionRepository {
        &mut get_repositories().permission
    }
}

impl HasRepository<QueryConfig, QueryConfigId, QueryConfigFilter, (), QueryConfigRepository>
    for QueryConfig
{
    fn repo() -> &'static mut QueryConfigRepository {
        &mut get_repositories().query_config
    }
}

impl HasRepository<Token, TokenId, TokenFilter, (), TokenRepository> for Token {
    fn repo() -> &'static mut TokenRepository {
        &mut get_repositories().token
    }
}

impl HasRepository<VotingConfig, VotingConfigId, VotingConfigFilter, (), VotingConfigRepository>
    for VotingConfig
{
    fn repo() -> &'static mut VotingConfigRepository {
        &mut get_repositories().voting_config
    }
}

impl HasRepository<Voting, VotingId, (), (), VotingRepository> for Voting {
    fn repo() -> &'static mut VotingRepository {
        &mut get_repositories().voting
    }
}
