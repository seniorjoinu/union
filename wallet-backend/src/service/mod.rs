use crate::service::group::types::GroupService;
use crate::service::permission::types::PermissionService;
use crate::service::query_config::types::QueryConfigService;
use crate::service::voting_config::types::VotingConfigService;
use candid::Principal;

pub mod choice;
pub mod cron;
pub mod events;
pub mod group;
pub mod history_ledger;
pub mod permission;
pub mod profile;
pub mod query_config;
pub mod streaming;
pub mod token;
pub mod voting;
pub mod voting_config;

pub fn init_services(this_canister_id: Principal) {
    GroupService::init_has_profile_group();
    PermissionService::init_allow_all_permission(this_canister_id);
    VotingConfigService::init_default_voting_config();
    QueryConfigService::init_default_query_config();
}
