use crate::repository::group::types::{GroupId, Shares};
use crate::repository::permission::types::Permission;
use crate::repository::profile::types::ProfileId;
use crate::repository::voting_config::types::{GroupOrProfile, VotesFormula, VotingConfigId};
use candid::{CandidType, Deserialize, Principal};
use shared::remote_call::RemoteCallPayload;
use shared::validation::{validate_and_trim_str, ValidationError};
use std::collections::{BTreeMap, HashMap};
use std::mem;

const VOTING_CHOICE_NAME_MIN_LEN: usize = 1;
const VOTING_CHOICE_NAME_MAX_LEN: usize = 200;
const VOTING_CHOICE_DESCRIPTION_MIN_LEN: usize = 0;
const VOTING_CHOICE_DESCRIPTION_MAX_LEN: usize = 2000;

pub const VOTING_NAME_MIN_LEN: usize = 1;
pub const VOTING_NAME_MAX_LEN: usize = 200;
pub const VOTING_DESCRIPTION_MIN_LEN: usize = 0;
pub const VOTING_DESCRIPTION_MAX_LEN: usize = 2000;

pub type VotingId = u64;
pub type ChoiceId = usize;

#[derive(Debug)]
pub enum VotingRepositoryError {
    ValidationError(ValidationError),
    VotingNotFound(VotingId),
    VotingInInvalidStatus(VotingId),
    ChoiceNotFound(VotingId, ChoiceId),
}

#[derive(Clone, CandidType, Deserialize)]
pub enum VotingStatus {
    Created,
    Rejected,
    PreRound(u16),
    Round(u16),
    Success,
    Fail(String),
}

#[derive(Clone, CandidType, Deserialize)]
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

#[derive(Clone, CandidType, Deserialize)]
pub struct Choice {
    pub name: String,
    pub description: String,
    pub program: Program,
    pub total_shares: BTreeMap<GroupOrProfile, Shares>,
    pub shares_by_voter: BTreeMap<GroupOrProfile, HashMap<Principal, Shares>>,
}

impl Choice {
    pub fn new(name: String, description: String, program: Program) -> Self {
        Self {
            name,
            description,
            program,
            total_shares: BTreeMap::new(),
            shares_by_voter: BTreeMap::new(),
        }
    }

    pub fn rejection() -> Self {
        Self {
            name: String::from("Reject"),
            description: String::from("Against all. I don't support this voting at all."),
            program: Program::Empty,
            total_shares: BTreeMap::new(),
            shares_by_voter: BTreeMap::new(),
        }
    }

    pub fn get_total_shares(&self, gop: &GroupOrProfile) -> Shares {
        self.total_shares.get(gop).cloned().unwrap_or_default()
    }

    pub fn get_shares_of_voter(&self, gop: &GroupOrProfile, voter: &Principal) -> Shares {
        let shares_map_opt = self.shares_by_voter.get(gop);

        if let Some(shares_map) = shares_map_opt {
            shares_map.get(voter).cloned().unwrap_or_default()
        } else {
            Shares::default()
        }
    }

    pub fn add_vote(&mut self, gop: GroupOrProfile, voter: Principal, shares: Shares) {
        self.shares_by_voter
            .entry(gop)
            .or_default()
            .insert(voter, shares.clone());

        self.total_shares
            .insert(gop, self.get_total_shares(&gop) + shares);
    }

    pub fn remove_vote(&mut self, gop: GroupOrProfile, voter: &Principal) {
        let prev_shares_opt = self.shares_by_voter.entry(gop).or_default().remove(voter);

        if let Some(prev_shares) = prev_shares_opt {
            self.total_shares
                .insert(gop, self.get_total_shares(&gop) - prev_shares);
        }
    }
}

#[derive(Clone, CandidType, Deserialize)]
pub struct ChoiceCreatePayload {
    pub name: String,
    pub description: String,
    pub program: Program,
}

impl ChoiceCreatePayload {
    pub fn validate(&mut self, permissions: Vec<&Permission>) -> Result<(), ValidationError> {
        self.name = validate_and_trim_str(
            mem::replace(&mut self.name, String::new()),
            VOTING_CHOICE_NAME_MIN_LEN,
            VOTING_CHOICE_NAME_MAX_LEN,
            "Name",
        )?;

        self.description = validate_and_trim_str(
            mem::replace(&mut self.description, String::new()),
            VOTING_CHOICE_DESCRIPTION_MIN_LEN,
            VOTING_CHOICE_DESCRIPTION_MAX_LEN,
            "Name",
        )?;

        if !permissions
            .iter()
            .any(|it| it.is_program_allowed(&self.program))
        {
            return Err(ValidationError(format!(
                "The program of custom choice '{}' is not allowed by the voting config config",
                &self.name
            )));
        }

        Ok(())
    }

    pub fn to_choice(self) -> Choice {
        Choice {
            name: self.name,
            description: self.description,
            program: self.program,
            total_shares: BTreeMap::new(),
            shares_by_voter: BTreeMap::new(),
        }
    }
}

#[derive(Clone, CandidType, Deserialize)]
pub struct Vote {
    pub voter: Voter,
    pub vote_type: VoteType,
}

#[derive(Clone, CandidType, Deserialize)]
pub enum Voter {
    Profile(ProfileId),
    Group((GroupId, Principal)),
}

#[derive(Clone, CandidType, Deserialize)]
pub enum VoteType {
    Rejection(Shares),
    Custom(BTreeMap<ChoiceId, Shares>),
}

#[derive(Clone, CandidType, Deserialize)]
pub struct Voting {
    pub id: VotingId,
    pub voting_config_id: VotingConfigId,

    pub status: VotingStatus,
    pub created_at: u64,
    pub updated_at: u64,
    pub proposer: Principal,

    pub name: String,
    pub description: String,

    pub start_condition: StartCondition,
    pub votes_formula: VotesFormula,

    pub winners_need: usize,
    pub winners: BTreeMap<ChoiceId, Choice>,

    pub custom_choices: BTreeMap<ChoiceId, Choice>,
    pub rejection_choice: Choice,
}

impl Voting {
    pub fn new(
        id: VotingId,
        voting_config_id: VotingConfigId,
        name: String,
        description: String,
        start_condition: StartCondition,
        votes_formula: VotesFormula,
        winners_need: usize,
        custom_choices: Vec<ChoiceCreatePayload>,
        proposer: Principal,
        timestamp: u64,
    ) -> Result<Self, VotingRepositoryError> {
        let voting = Self {
            id,
            voting_config_id,

            created_at: timestamp,
            updated_at: timestamp,
            status: VotingStatus::Created,
            proposer,

            name: Self::process_name(name)?,
            description: Self::process_description(description)?,

            start_condition,
            votes_formula,

            winners_need,
            winners: BTreeMap::new(),

            custom_choices: custom_choices
                .into_iter()
                .map(|it| it.to_choice())
                .enumerate()
                .collect(),
            rejection_choice: Choice::rejection(),
        };

        Ok(voting)
    }

    pub fn update(
        &mut self,
        new_name: Option<String>,
        new_description: Option<String>,
        new_start_condition: Option<StartCondition>,
        new_votes_formula: Option<VotesFormula>,
        new_winners_need: Option<usize>,
        new_custom_choices: Option<Vec<ChoiceCreatePayload>>,
        timestamp: u64,
    ) -> Result<(), VotingRepositoryError> {
        if !matches!(self.status, VotingStatus::Created) {
            return Err(VotingRepositoryError::VotingInInvalidStatus(self.id));
        }

        if let Some(name) = new_name {
            self.name = Self::process_name(name)?;
        }

        if let Some(description) = new_description {
            self.description = Self::process_description(description)?;
        }

        if let Some(start_condition) = new_start_condition {
            self.start_condition = start_condition;
        }

        if let Some(votes_formula) = new_votes_formula {
            self.votes_formula = votes_formula;
        }

        if let Some(winners_need) = new_winners_need {
            self.winners_need = winners_need;
        }

        if let Some(custom_choices) = new_custom_choices {
            self.custom_choices = custom_choices
                .into_iter()
                .map(|it| it.to_choice())
                .enumerate()
                .collect();
        }

        self.updated_at = timestamp;

        Ok(())
    }

    pub fn cast_vote(&mut self, vote: Vote, timestamp: u64) -> Result<(), VotingRepositoryError> {
        if !matches!(self.status, VotingStatus::Round(_)) {
            return Err(VotingRepositoryError::VotingInInvalidStatus(self.id));
        }

        let (gop, principal) = match vote.voter {
            Voter::Profile(p) => (GroupOrProfile::Profile(p), p),
            Voter::Group((g, p)) => (GroupOrProfile::Group(g), p),
        };

        self.clear_prev_votes(gop, &principal);
        self.put_new_vote(gop, principal, vote.vote_type)?;

        self.updated_at = timestamp;

        Ok(())
    }

    pub fn approve(&mut self, timestamp: u64) -> Result<(), VotingRepositoryError> {
        if !matches!(self.status, VotingStatus::Created) {
            return Err(VotingRepositoryError::VotingInInvalidStatus(self.id));
        }

        self.status = VotingStatus::PreRound(1);
        self.updated_at = timestamp;

        Ok(())
    }

    pub fn reject(&mut self, timestamp: u64) -> Result<(), VotingRepositoryError> {
        if !matches!(self.status, VotingStatus::Created | VotingStatus::Round(_)) {
            return Err(VotingRepositoryError::VotingInInvalidStatus(self.id));
        }

        self.status = VotingStatus::Rejected;
        self.updated_at = timestamp;

        Ok(())
    }

    pub fn start_round(&mut self, timestamp: u64) -> Result<(), VotingRepositoryError> {
        match self.status {
            VotingStatus::PreRound(round) => {
                self.status = VotingStatus::Round(round);
                self.updated_at = timestamp;

                Ok(())
            }
            _ => Err(VotingRepositoryError::VotingInInvalidStatus(self.id)),
        }
    }

    pub fn next_round(&mut self, timestamp: u64) -> Result<(), VotingRepositoryError> {
        match self.status {
            VotingStatus::Round(round) => {
                self.status = VotingStatus::PreRound(round + 1);
                self.updated_at = timestamp;

                Ok(())
            }
            _ => Err(VotingRepositoryError::VotingInInvalidStatus(self.id)),
        }
    }

    pub fn finish_success(&mut self, timestamp: u64) -> Result<(), VotingRepositoryError> {
        if !matches!(self.status, VotingStatus::Round(_)) {
            return Err(VotingRepositoryError::VotingInInvalidStatus(self.id));
        }

        self.status = VotingStatus::Success;
        self.updated_at = timestamp;

        Ok(())
    }

    pub fn finish_fail(
        &mut self,
        reason_msg: String,
        timestamp: u64,
    ) -> Result<(), VotingRepositoryError> {
        if !matches!(self.status, VotingStatus::Round(_)) {
            return Err(VotingRepositoryError::VotingInInvalidStatus(self.id));
        }

        self.status = VotingStatus::Fail(reason_msg);
        self.updated_at = timestamp;

        Ok(())
    }

    fn clear_prev_votes(&mut self, gop: GroupOrProfile, principal: &Principal) {
        self.rejection_choice.remove_vote(gop, principal);

        for (_, choice) in &mut self.custom_choices {
            choice.remove_vote(gop, principal);
        }
    }

    fn put_new_vote(
        &mut self,
        gop: GroupOrProfile,
        principal: Principal,
        vote_type: VoteType,
    ) -> Result<(), VotingRepositoryError> {
        match vote_type {
            VoteType::Rejection(shares) => {
                self.rejection_choice.add_vote(gop, principal, shares);
            }
            VoteType::Custom(votes) => {
                for (choice_id, shares) in votes {
                    let choice = self
                        .custom_choices
                        .get_mut(&choice_id)
                        .ok_or(VotingRepositoryError::ChoiceNotFound(self.id, choice_id))?;

                    choice.add_vote(gop, principal, shares);
                }
            }
        };

        Ok(())
    }

    fn process_name(name: String) -> Result<String, VotingRepositoryError> {
        validate_and_trim_str(name, VOTING_NAME_MIN_LEN, VOTING_NAME_MAX_LEN, "Name")
            .map_err(VotingRepositoryError::ValidationError)
    }

    fn process_description(description: String) -> Result<String, VotingRepositoryError> {
        validate_and_trim_str(
            description,
            VOTING_DESCRIPTION_MIN_LEN,
            VOTING_DESCRIPTION_MAX_LEN,
            "Description",
        )
        .map_err(VotingRepositoryError::ValidationError)
    }
}
