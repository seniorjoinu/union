use candid::Principal;
use shared::mvc::Id;
use shared::types::wallet::GroupId;
use candid::{CandidType, Deserialize};

pub type SharesMoveEntryId = Id;

#[derive(CandidType, Deserialize)]
pub struct SharesMoveEntryFilter {
    pub group_id: GroupId,
    pub principal_id: Principal
}