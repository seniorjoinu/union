use crate::repository::permission::types::PermissionId;
use candid::{CandidType, Deserialize};
use shared::types::wallet::{GroupId, ProfileId, Shares};

pub const QUERY_CONFIG_NAME_MIN_LEN: usize = 1;
pub const QUERY_CONFIG_NAME_MAX_LEN: usize = 200;
pub const QUERY_CONFIG_DESCRIPTION_MIN_LEN: usize = 0;
pub const QUERY_CONFIG_DESCRIPTION_MAX_LEN: usize = 2000;

#[derive(Clone, CandidType, Deserialize, Eq, PartialEq, Ord, PartialOrd)]
pub struct GroupCondition {
    pub id: GroupId,
    pub min_shares: Shares,
}

#[derive(Clone, CandidType, Deserialize, Eq, PartialEq, Ord, PartialOrd)]
pub enum AlloweeConstraint {
    Everyone,
    Group(GroupCondition),
    Profile(ProfileId),
}

#[derive(CandidType, Deserialize)]
pub struct AccessConfigFilter {
    pub permission: Option<PermissionId>,
    pub group: Option<GroupId>,
    pub profile: Option<ProfileId>,
}
