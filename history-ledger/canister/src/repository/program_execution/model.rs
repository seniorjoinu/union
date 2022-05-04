use candid::{CandidType, Deserialize, Principal};
use shared::mvc::Model;
use shared::remote_call::{Program, ProgramExecutionResult};
use shared::types::wallet::{ProgramExecutedEvent_0, ProgramExecutedWith};
use crate::repository::program_execution::types::ProgramExecutionEntryId;

#[derive(Clone, CandidType, Deserialize)]
pub struct ProgramExecutionEntry {
    id: Option<ProgramExecutionEntryId>,
    timestamp: u64,
    initiator: Principal,
    program_executed_with: ProgramExecutedWith,
    pub program: Option<Program>,
    pub result: Option<ProgramExecutionResult>,
}

impl ProgramExecutionEntry {
    pub fn from_event(ev: ProgramExecutedEvent_0) -> Self {
        Self {
            id: None,
            timestamp: ev.timestamp,
            initiator: ev.initiator,
            program_executed_with: ev.with,
            program: None,
            result: None,
        }
    }

    pub fn get_timestamp(&self) -> u64 {
        self.timestamp
    }

    pub fn get_initiator(&self) -> Principal { self.initiator }
    
    pub fn get_with(&self) -> ProgramExecutedWith { self.program_executed_with }
    
    pub fn set_program(&mut self, program: Program) {
        assert!(self.program.is_none());
        self.program = Some(program);
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
