use candid::{CandidType, Deserialize, Principal};
use shared::mvc::Id;
use shared::types::wallet::{ChoiceId, GroupId, GroupOrProfile};

pub type TokenId = Id;

#[derive(CandidType, Deserialize)]
pub struct TokenFilter {
    pub principal_id: Principal,
}

#[derive(Copy, Clone, CandidType, Deserialize)]
pub enum ChoiceOrGroup {
    Choice(ChoiceId, GroupOrProfile),
    Group(GroupId),
}
