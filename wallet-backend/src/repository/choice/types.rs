use candid::{CandidType, Deserialize};
use shared::types::wallet::VotingId;

pub const VOTING_CHOICE_NAME_MIN_LEN: usize = 1;
pub const VOTING_CHOICE_NAME_MAX_LEN: usize = 200;
pub const VOTING_CHOICE_DESCRIPTION_MIN_LEN: usize = 0;
pub const VOTING_CHOICE_DESCRIPTION_MAX_LEN: usize = 2000;

#[derive(CandidType, Deserialize)]
pub struct ChoiceFilter {
    pub voting_id: VotingId,
}
