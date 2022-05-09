use candid::{CandidType, Deserialize};
use shared::types::wallet::ChoiceId;
use std::collections::BTreeSet;

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

#[derive(Clone, CandidType, Deserialize)]
pub struct RoundResult {
    round: RoundId,
    choices: BTreeSet<ChoiceId>,
}

impl RoundResult {
    pub fn new(round: RoundId) -> Self {
        Self {
            round,
            choices: BTreeSet::new(),
        }
    }

    pub fn add_choice(&mut self, choice_id: ChoiceId) {
        self.choices.insert(choice_id);
    }

    pub fn get_choices(&self) -> &BTreeSet<ChoiceId> {
        &self.choices
    }

    pub fn len(&self) -> usize {
        self.choices.len()
    }

    pub fn is_empty(&self) -> bool {
        self.choices.is_empty()
    }
}
