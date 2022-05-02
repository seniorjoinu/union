use crate::repository::permission::types::PermissionId;
use crate::repository::voting_config::types::GroupCondition;
use candid::{CandidType, Deserialize};
use shared::mvc::Id;
use shared::types::wallet::{GroupOrProfile, ProfileId};

pub type AccessConfigId = Id;

pub const QUERY_CONFIG_NAME_MIN_LEN: usize = 1;
pub const QUERY_CONFIG_NAME_MAX_LEN: usize = 200;
pub const QUERY_CONFIG_DESCRIPTION_MIN_LEN: usize = 0;
pub const QUERY_CONFIG_DESCRIPTION_MAX_LEN: usize = 2000;

#[derive(Clone, CandidType, Deserialize, Eq, PartialEq, Ord, PartialOrd)]
pub enum AlloweeConstraint {
    Everyone,
    Group(GroupCondition),
    Profile(ProfileId),
}

impl AlloweeConstraint {
    pub fn to_group_or_profile(&self) -> Option<GroupOrProfile> {
        match &self {
            AlloweeConstraint::Everyone => None,
            AlloweeConstraint::Group(g) => Some(GroupOrProfile::Group(g.id)),
            AlloweeConstraint::Profile(p) => Some(GroupOrProfile::Profile(*p)),
        }
    }
}

#[derive(CandidType, Deserialize)]
pub struct AccessConfigFilter {
    pub permission: Option<PermissionId>,
    pub group_or_profile: Option<GroupOrProfile>,
}
