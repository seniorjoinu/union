use crate::repository::program_execution::model::ProgramExecutionEntry;
use crate::repository::program_execution::types::ProgramExecutionEntryId;
use candid::{CandidType, Deserialize};
use history_ledger_client::api::ProgramExecutionFilter;
use shared::mvc::{Model, Repository};
use shared::pageable::{Page, PageRequest, Pageable};
use shared::remote_call::{Program, RemoteCallEndpoint};
use shared::sorted_by_timestamp::SortedByTimestamp;
use std::collections::{BTreeMap, HashMap};

pub mod model;
pub mod types;

#[derive(Default, CandidType, Deserialize)]
pub struct ProgramExecutionRepository {
    entries: HashMap<ProgramExecutionEntryId, ProgramExecutionEntry>,

    sorted_by_timestamp: SortedByTimestamp<ProgramExecutionEntryId>,
    entries_by_endpoint_index: BTreeMap<RemoteCallEndpoint, Vec<ProgramExecutionEntryId>>,
}

impl Repository<ProgramExecutionEntry, ProgramExecutionEntryId, ProgramExecutionFilter, ()>
    for ProgramExecutionRepository
{
    fn save(&mut self, mut it: ProgramExecutionEntry) -> ProgramExecutionEntryId {
        if it.is_transient() {
            it._init_id(it.get_timestamp());
        }

        let id = it.get_id().unwrap();

        if let Some(p) = &it.program {
            if let Program::RemoteCallSequence(seq) = p {
                for call in seq {
                    self.entries_by_endpoint_index
                        .entry(call.endpoint.clone())
                        .or_default()
                        .push(id);
                    self.entries_by_endpoint_index
                        .entry(call.endpoint.to_wildcard())
                        .or_default()
                        .push(id);
                }
            }
        }

        self.sorted_by_timestamp.push(id, id);
        self.entries.insert(id, it);

        id
    }

    fn delete(&mut self, id: &ProgramExecutionEntryId) -> Option<ProgramExecutionEntry> {
        unreachable!();
    }

    fn get(&self, id: &ProgramExecutionEntryId) -> Option<ProgramExecutionEntry> {
        self.entries.get(id).cloned()
    }

    fn list(
        &self,
        page_req: &PageRequest<ProgramExecutionFilter, ()>,
    ) -> Page<ProgramExecutionEntry> {
        if page_req.filter.from_timestamp.is_none() && page_req.filter.to_timestamp.is_none() {
            return if let Some(endpoint) = &page_req.filter.endpoint {
                if let Some(index) = self.entries_by_endpoint_index.get(endpoint) {
                    let (has_next, iter) = index.iter().rev().get_page(page_req);
                    let data = iter.map(|id| self.get(id).unwrap()).collect();

                    Page::new(data, has_next)
                } else {
                    Page::empty()
                }
            } else {
                // FIXME: make it better, use iters
                let mut sorted = self.sorted_by_timestamp.get_all();
                sorted.reverse();

                let (has_next, iter) = sorted.iter().get_page(page_req);
                let data = iter.map(|id| self.get(id).unwrap()).collect();

                Page::new(data, has_next)
            };
        }

        let from = if let Some(from) = page_req.filter.from_timestamp {
            from
        } else {
            self.sorted_by_timestamp.get_first_timestamp()
        };

        let to = if let Some(to) = page_req.filter.to_timestamp {
            to
        } else {
            self.sorted_by_timestamp.get_last_timestamp()
        };

        // FIXME: make if better, use iters
        let mut ids = self.sorted_by_timestamp.get_by_interval(&from, &to);
        ids.reverse();

        if let Some(endpoint) = &page_req.filter.endpoint {
            if let Some(index) = self.entries_by_endpoint_index.get(endpoint) {
                let filtered_ids = ids
                    .into_iter()
                    .filter(|&id| index.contains(id))
                    .collect::<Vec<_>>();

                let (has_next, iter) = filtered_ids.iter().get_page(page_req);
                let data = iter.map(|id| self.get(id).unwrap()).collect();

                Page::new(data, has_next)
            } else {
                Page::empty()
            }
        } else {
            let (has_next, iter) = ids.iter().get_page(page_req);
            let data = iter.map(|id| self.get(id).unwrap()).collect();

            Page::new(data, has_next)
        }
    }
}
