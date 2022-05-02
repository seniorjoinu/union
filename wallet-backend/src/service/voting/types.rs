use crate::repository::voting_config::types::{Fraction, LenInterval};
use candid::{CandidType, Deserialize, Principal};
use shared::types::history_ledger::SharesInfo;
use shared::types::wallet::{ChoiceId, ProfileId, Shares, VotingConfigId, VotingId};
use shared::validation::ValidationError;
use std::collections::{BTreeMap, BTreeSet};

pub struct VotingService;

#[derive(Debug)]
pub enum VotingError {
    ValidationError(ValidationError),
    VotingConfigNotFound(VotingConfigId),
    InvalidWinnersCount(usize, LenInterval),
    ProfileNotExists(ProfileId),
    ProposerNotFoundInVotingConfig(Principal),
    EditorNotFoundInVotingConfig(Principal),
    VotingNotFound(VotingId),
    VotingInInvalidStatus(VotingId),
    InvalidVote,
    ProgramNotAllowedByVotingConfig,
    ChoiceNotFound(ChoiceId),
}

#[derive(CandidType, Deserialize)]
pub enum SingleChoiceVote {
    AsGroupMember(SharesInfo),
    AsProfileOwner,
}

#[derive(CandidType, Deserialize)]
pub enum MultiChoiceVote {
    AsGroupMember(MultiChoiceVoteAsGroupMember),
    AsProfileOwner(MultiChoiceVoteAsProfileOwner),
}

#[derive(CandidType, Deserialize)]
pub struct MultiChoiceVoteAsGroupMember {
    pub shares_info: SharesInfo,
    pub vote: BTreeMap<ChoiceId, Fraction>,
}

#[derive(CandidType, Deserialize)]
pub struct MultiChoiceVoteAsProfileOwner {
    pub vote: BTreeMap<ChoiceId, Fraction>,
}

#[derive(CandidType, Deserialize)]
pub enum Vote {
    Rejection(SingleChoiceVote),
    Approval(SingleChoiceVote),
    Common(MultiChoiceVote),
}
