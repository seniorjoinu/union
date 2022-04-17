use crate::repository::group::types::Shares;
use crate::repository::voting_config::types::{GroupOrProfile, VotesFormula};
use candid::{CandidType, Deserialize, Principal};
use shared::remote_call::RemoteCallPayload;
use shared::validation::ValidationError;
use std::collections::{BTreeMap, HashMap};

pub type VotingId = u64;
pub type ChoiceId = usize;

#[derive(Debug)]
pub enum VotingRepositoryError {
    ValidationError(ValidationError),
}

#[derive(CandidType, Deserialize)]
pub enum VotingStatus {
    Created,
    Rejected,
    PreRound(u16),
    Round(u16),
    Success,
    Executed(Vec<u8>),
    Fail(String),
}

#[derive(CandidType, Deserialize)]
pub enum StartCondition {
    ApprovalDelay(u64),
    ExactDate(u64),
}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub enum Program {
    Empty,
    RemoteCallSequence(Vec<RemoteCallPayload>),
}

impl Program {
    pub fn validate(&self) -> Result<(), VotingRepositoryError> {
        match self {
            Program::Empty => Ok(()),
            Program::RemoteCallSequence(seq) => {
                for call in seq {
                    call.args
                        .validate()
                        .map_err(|e| VotingRepositoryError::ValidationError(ValidationError(e)))?;
                }

                Ok(())
            }
        }
    }
}

#[derive(Default, CandidType, Deserialize)]
pub struct RejectionChoice {
    pub total_shares: BTreeMap<GroupOrProfile, Shares>,
    pub shares_by_voter: BTreeMap<GroupOrProfile, HashMap<Principal, Shares>>,
}

#[derive(CandidType, Deserialize)]
pub struct CustomChoice {
    pub name: String,
    pub description: String,
    pub program: Program,
    pub total_shares: BTreeMap<GroupOrProfile, Shares>,
    pub shares_by_voter: BTreeMap<GroupOrProfile, HashMap<Principal, Shares>>,
}

#[derive(CandidType, Deserialize)]
pub struct Voting {
    pub id: VotingId,
    pub status: VotingStatus,
    pub created_at: u64,
    pub updated_at: u64,
    pub proposer: Principal,

    pub name: String,
    pub description: String,

    pub start_condition: StartCondition,
    pub votes_formula: VotesFormula,

    pub winners_need: usize,
    pub winners: BTreeMap<ChoiceId, CustomChoice>,

    pub custom_choices: BTreeMap<ChoiceId, CustomChoice>,
    pub rejection_choice: RejectionChoice,
}
