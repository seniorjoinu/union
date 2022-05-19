use shared::mvc::Id;
use shared::types::wallet::VotingId;
use candid::{CandidType, Deserialize};
use crate::repository::nested_voting_config::types::NestedVotingConfigId;

#[derive(Debug, Copy, Clone, Ord, PartialOrd, Eq, PartialEq, CandidType, Deserialize)]
pub enum RemoteVotingId {
    Common(VotingId),
    Nested(NestedVotingId),
}

pub type NestedVotingId = Id;

#[derive(CandidType, Deserialize)]
pub struct NestedVotingFilter {
    pub nested_voting_config: Option<NestedVotingConfigId>,
}