use candid::{CandidType, Deserialize};

pub const VOTING_NAME_MIN_LEN: usize = 1;
pub const VOTING_NAME_MAX_LEN: usize = 200;
pub const VOTING_DESCRIPTION_MIN_LEN: usize = 0;
pub const VOTING_DESCRIPTION_MAX_LEN: usize = 2000;

pub type RoundId = u16;

#[derive(Debug, Clone, CandidType, Deserialize)]
pub enum VotingStatus {
    PreRound(RoundId),
    Round(RoundId),
    Rejected,
    Success,
    Fail(String),
}
