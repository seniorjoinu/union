use ic_cdk::export::candid::{CandidType, Deserialize, Principal};
use shared::candid::CandidCallResult;
use shared::remote_call::{RemoteCallEndpoint, RemoteCallPayload};
use std::collections::hash_map::Entry;
use std::collections::HashMap;

pub type RoleId = u32;
pub type PermissionId = u16;
pub type HistoryEntryId = u64;

#[derive(CandidType, Deserialize, Debug, Clone)]
pub enum ExecutionHistoryError {
    EntryNotFound,
    CandidError(String),
}

#[derive(CandidType, Deserialize, Debug)]
pub struct ExecutionHistoryState {
    pub union_id: Principal,
    
    pub entries: HashMap<HistoryEntryId, HistoryEntry>,
    pub entry_ids_counter: HistoryEntryId,

    pub entries_by_canister_id_index: HashMap<Principal, Vec<HistoryEntryId>>,
    pub entries_by_endpoint_index: HashMap<RemoteCallEndpoint, Vec<HistoryEntryId>>,
}

impl ExecutionHistoryState {
    pub fn create_pending_entry(
        &mut self,
        title: String,
        description: String,
        program: Program,
        timestamp: u64,
        role_id: RoleId,
        permission_id: PermissionId,
        authorized_by: Vec<Principal>,
    ) -> HistoryEntry {
        let id = self.generate_entry_id();

        HistoryEntry {
            id,
            entry_type: HistoryEntryType::Pending,
            title,
            description,
            program,
            timestamp,
            role_id,
            permission_id,
            authorized_by,
        }
    }

    pub fn add_executed_entry(&mut self, entry: HistoryEntry) {
        if matches!(entry.entry_type, HistoryEntryType::Pending) {
            unreachable!("Invalid history entry for execution");
        }

        self.add_entry_to_indexes(&entry);
        self.entries.insert(entry.id, entry);
    }

    pub fn get_entry_ids_cloned(&self) -> Vec<HistoryEntryId> {
        self.entries.keys().cloned().collect()
    }

    pub fn get_entry_ids_by_canister_id(&self, canister_id: &Principal) -> Vec<HistoryEntryId> {
        self.entries_by_canister_id_index
            .get(canister_id)
            .cloned()
            .unwrap_or_default()
    }

    pub fn get_entry_ids_by_endpoint(&self, endpoint: &RemoteCallEndpoint) -> Vec<HistoryEntryId> {
        self.entries_by_endpoint_index
            .get(endpoint)
            .cloned()
            .unwrap_or_default()
    }

    pub fn get_entry_by_id(
        &self,
        entry_id: &HistoryEntryId,
    ) -> Result<&HistoryEntry, ExecutionHistoryError> {
        self.entries
            .get(entry_id)
            .ok_or(ExecutionHistoryError::EntryNotFound)
    }

    fn add_entry_to_indexes(&mut self, entry: &HistoryEntry) {
        if let Program::RemoteCallSequence(calls) = &entry.program {
            for call in calls {
                match self
                    .entries_by_canister_id_index
                    .entry(call.endpoint.canister_id)
                {
                    Entry::Occupied(mut e) => {
                        e.get_mut().push(entry.id);
                    }
                    Entry::Vacant(e) => {
                        e.insert(vec![entry.id]);
                    }
                };

                match self.entries_by_endpoint_index.entry(call.endpoint.clone()) {
                    Entry::Occupied(mut e) => {
                        e.get_mut().push(entry.id);
                    }
                    Entry::Vacant(e) => {
                        e.insert(vec![entry.id]);
                    }
                }
            }
        }
    }

    fn generate_entry_id(&mut self) -> HistoryEntryId {
        let id = self.entry_ids_counter;
        self.entry_ids_counter += 1;

        id
    }
}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct HistoryEntry {
    pub id: HistoryEntryId,
    pub entry_type: HistoryEntryType,
    pub title: String,
    pub description: String,
    pub program: Program,
    pub timestamp: u64,
    pub role_id: RoleId,
    pub permission_id: PermissionId,
    pub authorized_by: Vec<Principal>,
}

impl HistoryEntry {
    pub fn set_executed(&mut self, timestamp: u64, result: Vec<CandidCallResult<String>>) {
        match &mut self.entry_type {
            HistoryEntryType::Pending => {
                self.entry_type = HistoryEntryType::Executed((timestamp, result));
            }
            _ => unreachable!("Only pending history entry can become executed"),
        };
    }

    pub fn set_declined(&mut self, timestamp: u64, error: String) {
        match &mut self.entry_type {
            HistoryEntryType::Pending => {
                self.entry_type = HistoryEntryType::Declined((timestamp, error));
            }
            _ => unreachable!("Only pending history entry can become declined"),
        }
    }
}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub enum HistoryEntryType {
    Executed((u64, Vec<CandidCallResult<String>>)),
    Declined((u64, String)),
}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub enum Program {
    Empty,
    RemoteCallSequence(Vec<RemoteCallPayload>),
}

impl Program {
    pub fn validate(&self) -> Result<(), ExecutionHistoryError> {
        match self {
            Program::Empty => Ok(()),
            Program::RemoteCallSequence(seq) => {
                for call in seq {
                    call.args.validate()?;
                }

                Ok(())
            }
        }
    }
}
