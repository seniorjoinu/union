use candid::{CandidType, Deserialize, Principal};
use shared::mvc::{Model};
use shared::remote_call::{Program, ProgramExecutionResult, RemoteCallEndpoint};
use shared::types::wallet::{ChoiceId, ProgramExecutedEvent_1, VotingConfigId, VotingId};
use std::collections::BTreeMap;
use crate::repository::program_execution::types::ProgramExecutionEntryId;

#[derive(Clone, CandidType, Deserialize)]
pub struct ProgramExecutionEntry {
    id: Option<ProgramExecutionEntryId>,
    timestamp: u64,
    pub program: Program,
    pub result: Option<ProgramExecutionResult>,
}

impl ProgramExecutionEntry {
    pub fn from_event(ev: ProgramExecutedEvent_1) -> Self {
        Self {
            id: None,
            timestamp: ev.timestamp,
            program: ev.progam,
            result: None,
        }
    }

    pub fn get_timestamp(&self) -> u64 {
        self.timestamp
    }

    pub fn set_result(&mut self, result: ProgramExecutionResult) {
        assert!(self.result.is_none());
        self.result = Some(result);
    }
}

impl Model<ProgramExecutionEntryId> for ProgramExecutionEntry {
    fn get_id(&self) -> Option<ProgramExecutionEntryId> {
        self.id
    }

    fn _init_id(&mut self, id: ProgramExecutionEntryId) {
        assert!(self.is_transient());
        self.id = Some(id);
    }

    fn is_transient(&self) -> bool {
        self.id.is_none()
    }
}
