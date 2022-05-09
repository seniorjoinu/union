use candid::{CandidType, Deserialize, Principal};
use shared::mvc::Id;
use shared::types::wallet::{ChoiceId, GroupId};

pub type TokenId = Id;

#[derive(CandidType, Deserialize)]
pub struct TokenFilter {
    pub principal_id: Principal,
}

#[derive(Copy, Clone, CandidType, Deserialize)]
pub enum ChoiceOrGroup {
    Choice(ChoiceId, GroupId),
    Group(GroupId),
}
