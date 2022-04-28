use crate::repository::shares_move::model::SharesMoveEntry;
use crate::repository::shares_move::types::{SharesMoveEntryFilter, SharesMoveEntryId};
use candid::{CandidType, Deserialize, Principal};
use shared::mvc::{IdGenerator, Model, Repository};
use shared::pageable::{Page, PageRequest, Pageable};
use shared::sorted_by_timestamp::SortedByTimestamp;
use shared::types::wallet::{GroupId, Shareholder};
use std::collections::HashMap;

pub mod model;
pub mod types;

#[derive(Default, CandidType, Deserialize)]
pub struct SharesMoveRepository {
    records: HashMap<SharesMoveEntryId, SharesMoveEntry>,
    id_gen: IdGenerator,

    records_by_timestamp_index: HashMap<(GroupId, Principal), SortedByTimestamp<SharesMoveEntryId>>,
}

impl Repository<SharesMoveEntry, SharesMoveEntryId, SharesMoveEntryFilter, ()>
    for SharesMoveRepository
{
    fn save(&mut self, mut it: SharesMoveEntry) -> SharesMoveEntryId {
        if it.is_transient() {
            it._init_id(self.id_gen.generate());
        }

        let id = it.get_id().unwrap();
        if let Shareholder::Principal(ps) = it.get_from() {
            self.add_to_timestamp_index(entry.group_id, ps.principal_id, entry.timestamp, id);
        }

        if let Shareholder::Principal(ps) = it.get_to() {
            self.add_to_timestamp_index(entry.group_id, ps.principal_id, entry.timestamp, id);
        }

        self.records.insert(id, it);

        id
    }

    fn delete(&mut self, id: &SharesMoveEntryId) -> Option<SharesMoveEntry> {
        unreachable!();
    }

    fn get(&self, id: &SharesMoveEntryId) -> Option<SharesMoveEntry> {
        self.records.get(id).cloned()
    }

    fn list(&self, page_req: &PageRequest<SharesMoveEntryFilter, ()>) -> Page<SharesMoveEntry> {
        if let Some(index) = self
            .records_by_timestamp_index
            .get(&(page_req.filter.group_id, page_req.filter.principal_id))
        {
            let (has_next, iter) = index.get_all().into_iter().get_page(page_req);
            let data = iter.map(|id| self.get(id).unwrap()).collect();

            Page::new(data, has_next)
        } else {
            Page::empty()
        }
    }
}

impl SharesMoveRepository {
    pub fn entry_of_at(
        &self,
        group_id: GroupId,
        of: Principal,
        timestamp: u64,
    ) -> Option<SharesMoveEntry> {
        let sorted = self.records_by_timestamp_index.get(&(group_id, of))?;
        let entries = sorted.most_actual_by(&timestamp)?;
        assert_eq!(entries.len(), 1);

        let id = entries.iter().next().unwrap();

        self.records.get(id).cloned()
    }

    fn add_to_timestamp_index(
        &mut self,
        group_id: GroupId,
        principal: Principal,
        timestamp: u64,
        id: SharesMoveEntryId,
    ) {
        self.records_by_timestamp_index
            .entry((group_id, principal))
            .or_default()
            .push(timestamp, id);
    }
}
