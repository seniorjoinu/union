use crate::cron_dequeue;
use crate::repository::voting_config::types::VotesFormula;
use candid::{CandidType, Deserialize, Principal};
use ic_cron::types::TaskId;
use shared::remote_call::Program;
use shared::types::wallet::{
    ChoiceId, ChoiceView, GroupId, GroupOrProfile, ProfileId, Shares, VotingConfigId, VotingId,
};
use shared::validation::{validate_and_trim_str, ValidationError};
use std::collections::{BTreeMap, HashMap};
use std::mem;

pub const VOTING_NAME_MIN_LEN: usize = 1;
pub const VOTING_NAME_MAX_LEN: usize = 200;
pub const VOTING_DESCRIPTION_MIN_LEN: usize = 0;
pub const VOTING_DESCRIPTION_MAX_LEN: usize = 2000;

#[derive(Debug)]
pub enum VotingRepositoryError {
    ValidationError(ValidationError),
    VotingNotFound(VotingId),
    VotingInInvalidStatus(VotingId),
    ChoiceNotFound(VotingId, ChoiceId),
}

#[derive(Debug, Clone, CandidType, Deserialize)]
pub enum VotingStatus {
    Created,
    Rejected,
    PreRound(u16),
    Round(u16),
    Success,
    Fail(String),
}

// TODO: include approval delay
#[derive(Clone, CandidType, Deserialize)]
pub enum StartCondition {
    ExactDate(u64),
}

#[derive(Clone, CandidType, Deserialize)]
pub struct Vote {
    pub voter: Voter,
    pub vote_type: VoteType,
}

#[derive(Debug, Clone, Copy, CandidType, Deserialize)]
pub enum Voter {
    Profile(ProfileId),
    Group((GroupId, Principal)),
}

#[derive(Clone, CandidType, Deserialize)]
pub enum VoteType {
    Rejection(Shares),
    Custom(BTreeMap<ChoiceId, Shares>),
}
