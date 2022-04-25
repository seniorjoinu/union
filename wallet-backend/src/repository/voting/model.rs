use crate::cron_dequeue;
use crate::repository::voting::types::{StartCondition, VotingStatus};
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

// TODO: move to new tokens
// TODO: add START status and START threshold
// TODO: figure out how to check threshold reach with new tokens
// TODO: add APPROVAL choice

#[derive(Clone, CandidType, Deserialize)]
pub struct Voting {
    pub id: VotingId,
    pub voting_config_id: VotingConfigId,

    pub status: VotingStatus,
    pub created_at: u64,
    pub updated_at: u64,
    pub proposer: Principal,

    pub task_id: Option<TaskId>,

    pub name: String,
    pub description: String,

    pub total_supplies: BTreeMap<GroupOrProfile, Shares>,
    pub total_non_rejection: BTreeMap<GroupOrProfile, Shares>,

    pub start_condition: StartCondition,

    pub winners_need: usize,
    pub winners: BTreeMap<ChoiceId, Choice>,
    pub losers: BTreeMap<ChoiceId, Choice>,

    pub choices: BTreeMap<ChoiceId, Choice>,
    pub rejection_choice: Choice,
}

impl Voting {
    pub fn new(
        id: VotingId,
        voting_config_id: VotingConfigId,
        name: String,
        description: String,
        start_condition: StartCondition,
        winners_need: usize,
        custom_choices: Vec<ChoiceView>,
        proposer: Principal,
        timestamp: u64,
    ) -> Result<Self, VotingRepositoryError> {
        let mut choices = BTreeMap::new();

        for (id, c) in custom_choices.into_iter().enumerate() {
            let mut choice = Choice::from_external(c);
            choice
                .validate()
                .map_err(VotingRepositoryError::ValidationError)?;
            choices.insert(id, choice);
        }

        let voting = Self {
            id,
            voting_config_id,

            created_at: timestamp,
            updated_at: timestamp,
            status: VotingStatus::Created,
            proposer,
            task_id: None,

            name: Self::process_name(name)?,
            description: Self::process_description(description)?,

            start_condition,

            total_supplies: BTreeMap::new(),
            total_non_rejection: BTreeMap::new(),

            winners_need,
            winners: BTreeMap::new(),
            losers: BTreeMap::new(),

            choices: choices,
            rejection_choice: Choice::rejection(),
        };

        Ok(voting)
    }

    pub fn update(
        &mut self,
        new_name: Option<String>,
        new_description: Option<String>,
        new_start_condition: Option<StartCondition>,
        new_winners_need: Option<usize>,
        new_custom_choices: Option<Vec<ChoiceView>>,
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

        if let Some(winners_need) = new_winners_need {
            self.winners_need = winners_need;
        }

        if let Some(custom_choices) = new_custom_choices {
            let mut choices = BTreeMap::new();

            for (id, c) in custom_choices.into_iter().enumerate() {
                let mut choice = Choice::from_external(c);
                choice
                    .validate()
                    .map_err(VotingRepositoryError::ValidationError)?;
                choices.insert(id, choice);
            }

            self.choices = choices;
        }

        self.updated_at = timestamp;

        Ok(())
    }

    pub fn cast_vote(
        &mut self,
        vote: Vote,
        gop_total_supply: Shares,
        timestamp: u64,
    ) -> Result<(), VotingRepositoryError> {
        if !matches!(self.status, VotingStatus::Round(_) | VotingStatus::Created) {
            return Err(VotingRepositoryError::VotingInInvalidStatus(self.id));
        }

        let (gop, principal) = match vote.voter {
            Voter::Profile(p) => {
                let gop = GroupOrProfile::Profile(p);

                self.total_supplies.insert(gop, gop_total_supply);
                (gop, p)
            }
            Voter::Group((g, p)) => {
                let gop = GroupOrProfile::Group(g);

                let group_total_supply_old =
                    self.total_supplies.get(&gop).cloned().unwrap_or_default();

                assert!(
                    group_total_supply_old == Shares::default()
                        || group_total_supply_old == gop_total_supply
                );
                self.total_supplies.insert(gop, gop_total_supply);

                (gop, p)
            }
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

    pub fn set_task_id(&mut self, task_id: TaskId) {
        if self.task_id.is_some() {
            unreachable!()
        }

        self.task_id = Some(task_id);
    }

    // TODO: move out of here
    pub fn deschedule_task_id(&mut self) {
        if let Some(task_id) = self.task_id {
            cron_dequeue(task_id).unwrap();
        }
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

        for (_, choice) in &mut self.choices {
            let voter_shares_opt = choice.remove_vote(gop, principal);

            if let Some(voter_shares) = voter_shares_opt {
                let total_gop_shares = self.total_non_rejection.remove(&gop).unwrap_or_default();
                self.total_non_rejection
                    .insert(gop, total_gop_shares - voter_shares);
            }
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
                        .choices
                        .get_mut(&choice_id)
                        .ok_or(VotingRepositoryError::ChoiceNotFound(self.id, choice_id))?;

                    let total_gop_shares =
                        self.total_non_rejection.remove(&gop).unwrap_or_default();
                    self.total_non_rejection
                        .insert(gop, total_gop_shares + shares.clone());

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
