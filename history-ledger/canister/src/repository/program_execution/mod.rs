use crate::repository::program_execution::model::ProgramExecutionEntry;
use crate::repository::program_execution::types::ProgramExecutionEntryId;
use candid::{CandidType, Deserialize, Principal};
use history_ledger_client::api::{VotingExecutionRecordExternal, VotingExecutionRecordFilter};
use shared::mvc::{Model, Repository};
use shared::pageable::{Page, PageRequest, Pageable};
use shared::remote_call::{Program, ProgramExecutionResult, RemoteCallEndpoint};
use shared::sorted_by_timestamp::SortedByTimestamp;
use shared::types::wallet::{ChoiceId, VotingConfigId, VotingId};
use std::collections::{BTreeMap, BTreeSet, HashMap};

pub mod model;
pub mod types;

#[derive(Default, CandidType, Deserialize)]
pub struct ProgramExecutionRepository {
    pub entries: HashMap<ProgramExecutionEntryId, ProgramExecutionEntry>,
}

impl Repository<ProgramExecutionEntry, ProgramExecutionEntryId, (), ()>
    for ProgramExecutionRepository
{
    fn save(&mut self, mut it: ProgramExecutionEntry) -> ProgramExecutionEntryId {
        if it.is_transient() {
            it._init_id(it.get_timestamp());
        }
        
        let id = it.get_id().unwrap();
        self.entries.insert(id, it);
        
        id
    }

    fn delete(&mut self, id: &ProgramExecutionEntryId) -> Option<ProgramExecutionEntry> {
        unreachable!();
    }

    fn get(&self, id: &ProgramExecutionEntryId) -> Option<ProgramExecutionEntry> {
        self.entries.get(id).cloned()
    }

    fn list(&self, page_req: &PageRequest<(), ()>) -> Page<ProgramExecutionEntry> {
        let (has_next, iter) = self.entries.iter().get_page(page_req);
        let data = iter.map(|(_, it)| it.clone()).collect();
        
        Page::new(data, has_next)
    }
}
