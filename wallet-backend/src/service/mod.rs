use crate::service::_group::_init_has_profile_group;
use crate::service::_permission::_init_default_permission;
use crate::service::voting_config::_init_default_voting_config;

pub mod permission;
pub mod choice;
pub mod cron;
pub mod group;
pub mod history_ledger;
pub mod profile;
pub mod query_config;
pub mod streaming;
pub mod token;
pub mod voting;
pub mod voting_config;

pub fn init_services() {
    _init_has_profile_group();
    _init_default_permission();
    _init_default_voting_config();
}
