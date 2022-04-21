use candid::{CandidType, Deserialize, Principal};
use shared::remote_call::{ProgramExecutionResult, RemoteCallEndpoint};
use shared::types::wallet::{ChoiceExternal, ChoiceId, VotingConfigId, VotingId};
use std::collections::BTreeMap;

#[derive(Debug)]
pub enum VotingExecutionRepositoryError {
    RecordAlreadyExists(VotingId),
    ChoiceAlreadyExists(VotingId, ChoiceId),
    ResultAlreadyExists(VotingId, ChoiceId),
}

#[derive(CandidType, Deserialize)]
pub struct VotingExecutionRecordExternal {
    pub voting_id: VotingId,
    pub voting_config_id: VotingConfigId,
    pub name: String,
    pub description: String,
    pub timestamp: u64,
    pub winners_count: usize,
}

#[derive(CandidType, Deserialize)]
pub struct VotingExecutionRecord {
    pub voting_id: VotingId,
    pub voting_config_id: VotingConfigId,
    pub name: String,
    pub description: String,
    pub timestamp: u64,
    pub winners_count: usize,
    pub winners: BTreeMap<ChoiceId, ChoiceExternal>,
    pub results: BTreeMap<ChoiceId, ProgramExecutionResult>,
}

impl VotingExecutionRecord {
    pub fn new(
        voting_id: VotingId,
        voting_config_id: VotingConfigId,
        name: String,
        description: String,
        timestamp: u64,
        winners_count: usize,
    ) -> Self {
        Self {
            voting_id,
            voting_config_id,
            name,
            description,
            timestamp,
            winners_count,
            winners: BTreeMap::default(),
            results: BTreeMap::default(),
        }
    }

    pub fn to_external_cloned(&self) -> VotingExecutionRecordExternal {
        VotingExecutionRecordExternal {
            voting_id: self.voting_id,
            voting_config_id: self.voting_config_id,
            name: self.name.clone(),
            description: self.description.clone(),
            timestamp: self.timestamp,
            winners_count: self.winners_count,
        }
    }

    #[inline(always)]
    pub fn has_winner(&self, choice_id: &ChoiceId) -> bool {
        self.winners.contains_key(choice_id)
    }

    #[inline(always)]
    pub fn add_winner(&mut self, choice_id: ChoiceId, choice: ChoiceExternal) {
        self.winners.insert(choice_id, choice);
    }

    #[inline(always)]
    pub fn has_result(&self, choice_id: &ChoiceId) -> bool {
        self.results.contains_key(choice_id)
    }

    #[inline(always)]
    pub fn add_result(&mut self, choice_id: ChoiceId, result: ProgramExecutionResult) {
        self.results.insert(choice_id, result);
    }
}

#[derive(CandidType, Deserialize)]
pub struct TimeInterval {
    pub from: u64,
    pub to: u64,
}

#[derive(CandidType, Deserialize)]
pub struct VotingExecutionRecordFilter {
    pub voting_config_id: Option<VotingConfigId>,
    pub canister_id: Option<Principal>,
    pub endpoint: Option<RemoteCallEndpoint>,
    pub time_interval: Option<TimeInterval>,
}
