use candid::{CandidType, Deserialize, Principal};
use shared::mvc::Id;

pub type TokenId = Id;

#[derive(CandidType, Deserialize)]
pub struct TokenFilter {
    pub principal_id: Principal,
}
