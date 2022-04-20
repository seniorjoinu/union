use crate::service::group::_init_has_profile_group;

pub mod group;
pub mod permission;
pub mod profile;

pub fn init_services() {
    _init_has_profile_group();
}
