use crate::repository::voting::types::{
    StartCondition, VotingStatus, VOTING_DESCRIPTION_MAX_LEN, VOTING_DESCRIPTION_MIN_LEN,
    VOTING_NAME_MAX_LEN, VOTING_NAME_MIN_LEN,
};
use candid::{CandidType, Deserialize, Principal};
use ic_cron::types::TaskId;
use shared::mvc::Model;
use shared::types::wallet::{ChoiceId, GroupOrProfile, Shares, VotingConfigId, VotingId};
use shared::validation::{validate_and_trim_str, ValidationError};
use std::collections::{BTreeMap, BTreeSet};

#[derive(Clone, CandidType, Deserialize)]
pub struct Voting {
    id: Option<VotingId>,
    voting_config_id: VotingConfigId,

    status: VotingStatus,
    created_at: u64,
    updated_at: u64,
    proposer: Principal,

    task_id: Option<TaskId>,

    name: String,
    description: String,

    start_condition: StartCondition,
    winners_need: usize,

    total_voting_power: BTreeMap<GroupOrProfile, Shares>,
    used_voting_power: BTreeMap<GroupOrProfile, Shares>,

    winners: BTreeSet<ChoiceId>,
    losers: BTreeSet<ChoiceId>,
    choices: BTreeSet<ChoiceId>,

    rejection_choice: ChoiceId,
    approval_choice: ChoiceId,
}

impl Voting {
    pub fn new(
        voting_config_id: VotingConfigId,
        name: String,
        description: String,
        start_condition: StartCondition,
        winners_need: usize,
        proposer: Principal,
        rejection_choice: ChoiceId,
        approval_choice: ChoiceId,
        timestamp: u64,
    ) -> Result<Self, ValidationError> {
        let voting = Self {
            id: None,
            voting_config_id,

            created_at: timestamp,
            updated_at: timestamp,
            status: VotingStatus::Created,
            proposer,
            task_id: None,

            name: Self::process_name(name)?,
            description: Self::process_description(description)?,

            start_condition,
            winners_need,

            total_voting_power: BTreeMap::new(),
            used_voting_power: BTreeMap::new(),

            winners: BTreeSet::new(),
            losers: BTreeSet::new(),
            choices: BTreeSet::new(),

            rejection_choice,
            approval_choice,
        };

        Ok(voting)
    }

    pub fn update(
        &mut self,
        new_name: Option<String>,
        new_description: Option<String>,
        new_start_condition: Option<StartCondition>,
        new_winners_need: Option<usize>,
        timestamp: u64,
    ) -> Result<(), ValidationError> {
        if !matches!(self.status, VotingStatus::Created) {
            return Err(ValidationError(format!(
                "Invalid voting status {:?}",
                self.status
            )));
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

        self.updated_at = timestamp;

        Ok(())
    }

    pub fn update_total_voting_power(
        &mut self,
        gop: GroupOrProfile,
        total_voting_power: Shares,
        timestamp: u64,
    ) {
        self.total_voting_power.insert(gop, total_voting_power);
        self.updated_at = timestamp;
    }

    pub fn add_used_voting_power(
        &mut self,
        gop: GroupOrProfile,
        voting_power: Shares,
        timestamp: u64,
    ) {
        let prev_vp = self.used_voting_power.remove(&gop).unwrap_or_default();
        self.used_voting_power.insert(gop, prev_vp + voting_power);
        self.updated_at = timestamp;
    }

    pub fn approve(&mut self, timestamp: u64) {
        assert!(matches!(self.status, VotingStatus::Created));

        self.status = VotingStatus::PreRound(1);
        self.updated_at = timestamp;
    }

    pub fn reject(&mut self, timestamp: u64) {
        assert!(matches!(
            self.status,
            VotingStatus::Created | VotingStatus::Round(_)
        ));

        self.status = VotingStatus::Rejected;
        self.updated_at = timestamp;
    }

    pub fn start_round(&mut self, timestamp: u64) {
        match self.status {
            VotingStatus::PreRound(round) => {
                self.status = VotingStatus::Round(round);
                self.updated_at = timestamp;
            }
            _ => unreachable!(),
        }
    }

    pub fn next_round(&mut self, timestamp: u64) {
        match self.status {
            VotingStatus::Round(round) => {
                self.status = VotingStatus::PreRound(round + 1);
                self.updated_at = timestamp;
            }
            _ => unreachable!(),
        }
    }

    pub fn finish_success(&mut self, timestamp: u64) {
        assert!(matches!(self.status, VotingStatus::Round(_)));

        self.status = VotingStatus::Success;
        self.updated_at = timestamp;
    }

    pub fn finish_fail(&mut self, reason_msg: String, timestamp: u64) {
        assert!(matches!(self.status, VotingStatus::Round(_)));

        self.status = VotingStatus::Fail(reason_msg);
        self.updated_at = timestamp;
    }

    pub fn set_cron_task(&mut self, task_id: TaskId, timestamp: u64) {
        self.task_id = Some(task_id);
        self.updated_at = timestamp;
    }

    pub fn add_winner(&mut self, choice_id: ChoiceId, timestamp: u64) {
        self.winners.insert(choice_id);
        self.updated_at = timestamp;
    }

    pub fn remove_winner(&mut self, choice_id: &ChoiceId, timestamp: u64) {
        self.winners.remove(choice_id);
        self.updated_at = timestamp;
    }

    pub fn add_loser(&mut self, choice_id: ChoiceId, timestamp: u64) {
        self.losers.insert(choice_id);
        self.updated_at = timestamp;
    }

    pub fn remove_loser(&mut self, choice_id: &ChoiceId, timestamp: u64) {
        self.losers.remove(choice_id);
        self.updated_at = timestamp;
    }

    pub fn add_choice(&mut self, choice_id: ChoiceId, timestamp: u64) {
        self.choices.insert(choice_id);
        self.updated_at = timestamp;
    }

    pub fn remove_choice(&mut self, choice_id: &ChoiceId, timestamp: u64) {
        self.choices.remove(choice_id);
        self.updated_at = timestamp;
    }

    pub fn get_winners(&self) -> &BTreeSet<ChoiceId> {
        &self.winners
    }

    pub fn get_losers(&self) -> &BTreeSet<ChoiceId> {
        &self.losers
    }

    pub fn get_choices(&self) -> &BTreeSet<ChoiceId> {
        &self.choices
    }

    pub fn get_approval_choice(&self) -> &ChoiceId {
        &self.approval_choice
    }

    pub fn get_rejection_choice(&self) -> &ChoiceId {
        &self.rejection_choice
    }

    pub fn get_used_voting_power(&self) -> &BTreeMap<GroupOrProfile, Shares> {
        &self.used_voting_power
    }

    pub fn get_total_voting_power(&self) -> &BTreeMap<GroupOrProfile, Shares> {
        &self.total_voting_power
    }

    pub fn get_winners_need(&self) -> &usize {
        &self.winners_need
    }

    pub fn get_start_condition(&self) -> &StartCondition {
        &self.start_condition
    }

    pub fn get_status(&self) -> &VotingStatus {
        &self.status
    }

    pub fn get_cron_task(&self) -> Option<TaskId> {
        self.task_id
    }

    fn process_name(name: String) -> Result<String, ValidationError> {
        validate_and_trim_str(
            name,
            VOTING_NAME_MIN_LEN,
            VOTING_NAME_MAX_LEN,
            "Voting name",
        )
    }

    fn process_description(description: String) -> Result<String, ValidationError> {
        validate_and_trim_str(
            description,
            VOTING_DESCRIPTION_MIN_LEN,
            VOTING_DESCRIPTION_MAX_LEN,
            "Voting description",
        )
    }
}

impl Model<VotingId> for Voting {
    fn get_id(&self) -> Option<VotingId> {
        self.id
    }

    fn _init_id(&mut self, id: VotingId) {
        assert!(self.is_transient());
        self.id = Some(id);
    }

    fn is_transient(&self) -> bool {
        self.id.is_none()
    }
}
