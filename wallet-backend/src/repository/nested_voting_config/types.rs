use candid::{CandidType, Deserialize, Principal};
use shared::mvc::Id;
use shared::types::wallet::VotingConfigId;

pub const NESTED_VOTING_CONFIG_NAME_MIN_LEN: usize = 1;
pub const NESTED_VOTING_CONFIG_NAME_MAX_LEN: usize = 200;
pub const NESTED_VOTING_CONFIG_DESCRIPTION_MIN_LEN: usize = 0;
pub const NESTED_VOTING_CONFIG_DESCRIPTION_MAX_LEN: usize = 2000;

#[derive(Copy, Clone, CandidType, Deserialize)]
pub enum NestedVoteCalculation {
    Total,
    Turnout,
}

#[derive(Debug, Copy, Clone, CandidType, Deserialize)]
pub enum RemoteVotingConfigId {
    Common(VotingConfigId),
    Nested(NestedVotingConfigId),
}

pub type NestedVotingConfigId = Id;

#[derive(CandidType, Deserialize)]
pub struct NestedVotingConfigFilter {
    pub remote_voting_config: Option<(Principal, VotingConfigId)>,
    pub remote_nested_voting_config: Option<(Principal, NestedVotingConfigId)>,
}
