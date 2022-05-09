use crate::repository::voting_config::types::{Fraction, LenInterval};
use candid::{CandidType, Deserialize};
use shared::types::history_ledger::SharesInfo;
use shared::types::wallet::{ChoiceId, ProfileId, VotingConfigId, VotingId};
use shared::validation::ValidationError;
use std::collections::BTreeMap;

pub struct VotingService;

#[derive(Debug)]
pub enum VotingError {
    ValidationError(ValidationError),
    VotingConfigNotFound(VotingConfigId),
    InvalidWinnersCount(u32, LenInterval),
    ProfileNotExists(ProfileId),
    VotingNotFound(VotingId),
    VotingInInvalidStatus(VotingId),
    InvalidVote,
    ProgramNotAllowedByVotingConfig,
    ChoiceNotFound(ChoiceId),
    VotingOnlyAllowedDuringRounds,
    VoteFractionTooBig,
    VoterCantApprove,
    VoterCantReject,
    VoterCantVote,
    SharesInfoSignatureInvalid,
    SharesInfoTimestampInvalid,
    InsufficientSharesBalance,
    SharesInfoDoesntBelongToVoter,
}

#[derive(CandidType, Deserialize)]
pub struct SingleChoiceVote {
    pub shares_info: SharesInfo,
}

#[derive(CandidType, Deserialize)]
pub struct MultiChoiceVote {
    pub shares_info: SharesInfo,
    pub vote: BTreeMap<ChoiceId, Fraction>,
}

#[derive(CandidType, Deserialize)]
pub enum Vote {
    Rejection(SingleChoiceVote),
    Approval(SingleChoiceVote),
    Common(MultiChoiceVote),
}
